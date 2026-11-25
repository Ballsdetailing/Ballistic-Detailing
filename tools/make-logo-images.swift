import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
// Usage (from the project folder): swift tools/make-logo-images.swift images/logo-original.jpg images
let src = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])

guard let isrc = CGImageSourceCreateWithURL(src as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(isrc, 0, nil) else { fatalError("load") }
let W = img.width, H = img.height
let cs = CGColorSpace(name: CGColorSpace.sRGB)!

func rgbaContext(_ w: Int, _ h: Int) -> CGContext {
    CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
              space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
}

// Load pixels top-down
let base = rgbaContext(W, H)
base.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
let px = base.data!.bindMemory(to: UInt8.self, capacity: W * H * 4)

// Find the black circle: bounding box of rows/cols that contain long near-black runs
var minX = W, maxX = 0, minY = H, maxY = 0
for y in 0..<H {
    for x in 0..<W {
        let i = (y * W + x) * 4
        if Int(px[i]) + Int(px[i+1]) + Int(px[i+2]) < 12 {
            minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
        }
    }
}
let cx = Double(minX + maxX) / 2, cy = Double(minY + maxY) / 2
let r = Double(min(maxX - minX, maxY - minY)) / 2
print("circle center \(cx),\(cy) r \(r)")

func save(_ image: CGImage, _ name: String, _ type: UTType, quality: Double = 0.85) {
    let url = outDir.appendingPathComponent(name)
    let dest = CGImageDestinationCreateWithURL(url as CFURL, type.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, image, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
    CGImageDestinationFinalize(dest)
}

// Circle crop (CG coords are bottom-up for drawing rects)
let rr = r - 2
let cropRect = CGRect(x: cx - rr, y: cy - rr, width: rr * 2, height: rr * 2) // top-down image coords
let circleImg = img.cropping(to: cropRect.integral)!

func circle(size: Int, transparent: Bool) -> CGImage {
    let c = rgbaContext(size, size)
    c.interpolationQuality = .high
    if !transparent {
        c.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1)); c.fill(CGRect(x: 0, y: 0, width: size, height: size))
    } else {
        c.addEllipse(in: CGRect(x: 0, y: 0, width: size, height: size)); c.clip()
    }
    c.draw(circleImg, in: CGRect(x: 0, y: 0, width: size, height: size))
    return c.makeImage()!
}

save(circle(size: 512, transparent: true), "logo-circle-512.png", .png)
save(circle(size: 192, transparent: true), "icon-192.png", .png)
save(circle(size: 512, transparent: false), "icon-512.png", .png)
save(circle(size: 180, transparent: false), "apple-touch-icon.png", .png)
save(circle(size: 32, transparent: true), "favicon-32.png", .png)
save(circle(size: 16, transparent: true), "favicon-16.png", .png)

// favicon.ico wrapping the 32px PNG
let png32 = try! Data(contentsOf: outDir.appendingPathComponent("favicon-32.png"))
var ico = Data([0, 0, 1, 0, 1, 0, 32, 32, 0, 0, 1, 0, 32, 0])
var sz = UInt32(png32.count).littleEndian; ico.append(Data(bytes: &sz, count: 4))
var off = UInt32(22).littleEndian; ico.append(Data(bytes: &off, count: 4))
ico.append(png32)
try! ico.write(to: outDir.deletingLastPathComponent().appendingPathComponent("favicon.ico"))

// Wordmark (car + BALLISTIC + DETAILING): find bounding box of bright pixels inside circle
var bx0 = W, bx1 = 0, by0 = H, by1 = 0
for y in 0..<H { for x in 0..<W {
    let dx = Double(x) - cx, dy = Double(y) - cy
    if dx*dx + dy*dy > (r - 6) * (r - 6) { continue }
    let i = (y * W + x) * 4
    if max(px[i], px[i+1], px[i+2]) > 40 {
        bx0 = min(bx0, x); bx1 = max(bx1, x); by0 = min(by0, y); by1 = max(by1, y)
    }
}}
let pad = 6
let wmRect = CGRect(x: bx0 - pad, y: by0 - pad, width: bx1 - bx0 + pad * 2, height: by1 - by0 + pad * 2)
print("wordmark \(wmRect)")
let wm = img.cropping(to: wmRect)!

// "Unscreen": alpha = max channel so the mark sits on any dark background
func wordmark(width: Int) -> CGImage {
    let h = Int((Double(width) * Double(wm.height) / Double(wm.width)).rounded())
    let c = rgbaContext(width, h)
    c.interpolationQuality = .high
    c.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1)); c.fill(CGRect(x: 0, y: 0, width: width, height: h))
    c.draw(wm, in: CGRect(x: 0, y: 0, width: width, height: h))
    let p = c.data!.bindMemory(to: UInt8.self, capacity: width * h * 4)
    let scale = Double(width) / Double(wm.width)
    for i in stride(from: 0, to: width * h * 4, by: 4) {
        let px = (i / 4) % width, py = (i / 4) / width
        let sx = Double(wmRect.minX) + Double(px) / scale - cx, sy = Double(wmRect.minY) + Double(py) / scale - cy
        if sx * sx + sy * sy > (r - 4) * (r - 4) { p[i] = 0; p[i+1] = 0; p[i+2] = 0; p[i+3] = 0; continue }
        let m = max(p[i], p[i+1], p[i+2])
        // Premultiplied: keep color, set alpha = max channel
        p[i+3] = m
    }
    return c.makeImage()!
}
save(wordmark(width: 300), "logo-wordmark-300.png", .png)
save(wordmark(width: 600), "logo-wordmark-600.png", .png)

// Share image 1200x630: black canvas, circle logo centered
let og = rgbaContext(1200, 630)
og.interpolationQuality = .high
og.setFillColor(CGColor(red: 0.02, green: 0.03, blue: 0.05, alpha: 1)); og.fill(CGRect(x: 0, y: 0, width: 1200, height: 630))
// soft blue glow
let grad = CGGradient(colorsSpace: cs, colors: [CGColor(red: 0.1, green: 0.4, blue: 1, alpha: 0.35), CGColor(red: 0.1, green: 0.4, blue: 1, alpha: 0)] as CFArray, locations: [0, 1])!
og.drawRadialGradient(grad, startCenter: CGPoint(x: 600, y: 315), startRadius: 0, endCenter: CGPoint(x: 600, y: 315), endRadius: 420, options: [])
let ogc = circle(size: 560, transparent: true)
og.draw(ogc, in: CGRect(x: 320, y: 35, width: 560, height: 560))
save(og.makeImage()!, "og-image.jpg", .jpeg, quality: 0.82)
print("done")
