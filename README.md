# Ballistic Detailing website

A static site for Ballistic Detailing, mobile car detailing in Cape Coral & Fort Myers, FL.
Plain HTML, CSS and JavaScript. No build step, no backend, no accounts. Bookings are sent as a pre-written text message from the customer's phone.

## What's in the folder

| Path | What it is |
| --- | --- |
| `index.html`, `packages.html`, `gallery.html`, `book.html`, `faq.html`, `contact.html` | The six pages |
| `js/config.js` | **Every editable setting**: phone, hours, services, prices, gallery, text-message wording, FAQ |
| `js/site.js` | Builds the header, footer, package cards, gallery and FAQ from the config |
| `js/book.js` | The booking form and text message |
| `css/styles.css` | All styling |
| `images/` | Logo files, icons, share image |
| `images/before-after/` | Before & after photos |
| `tools/make-logo-images.swift` | Optional: regenerates all logo/icon sizes from one image (Mac only) |
| `sitemap.xml`, `robots.txt`, `site.webmanifest`, `favicon.ico` | Search engine and browser files |

To preview on your computer, open a terminal in this folder and run `python3 -m http.server 8000`, then visit http://localhost:8000. (Double-clicking the HTML files also works for a quick look.)

## Editing business info

Open `js/config.js` in any text editor. Each section has a comment explaining it.

- **Phone**: change both `phoneDisplay` (how it looks) and `phoneE164` (`+1` followed by the 10 digits). The call, text and booking links all use `phoneE164`.
- **Instagram**: `instagramHandle`, without the @.
- **Service area**: `serviceArea` and `areaCities`.
- **Hours**: in `hours`, use the 24-hour clock (`"08:00"`, `"23:00"`). `latestStart` is the latest start time offered for any service (now `"22:00"`, 10:00 PM). Set a day to `false` in `days` to close it; customers then can't book that day and the site shows your open days.
- **Services**: edit names, checklists (`items`), descriptions (`summary`) and estimated times (`time`) in `services`. A `type: "detail"` service allows the Headlight Restoration add-on; `type: "standalone"` doesn't. The booking dropdown lists every service automatically.
- **FAQ**: edit questions and answers in `faq`.

Note: a few spots in the HTML (page titles, search descriptions, and one contact line shown if JavaScript is off) also mention the phone number or area. If you change the phone number, search the `.html` files for `978-836-6006` too.

## Editing the text message wording

In `js/config.js`, `booking.message` is a list of lines. Words in `{curly braces}` are filled in from the form:
`{business} {name} {phone} {vehicle} {service} {addon} {address} {date} {time} {notes}`.
An empty line `""` adds a blank line. `noneText` is used when there is no add-on or no notes. `sendNote` and `requestNote` are the notes shown on the Book page.

## Turning prices on or off

Prices are stored in `js/config.js` (`price: 80` etc.) but hidden. To show them on the package cards, change:

```js
showPrices: false,
```

to `true`. Change it back to `false` to hide them again. The booking form never shows prices.

## Adding before & after photos

1. Put your two photos in `images/before-after/` (for example `civic-before.jpg` and `civic-after.jpg`). Photos in a 4:3 landscape shape look best. Keep each under about 300 KB: export at around 1200 px wide, JPG quality 75-80 (on a Mac: open in Preview, Tools > Adjust Size, then File > Export as JPEG).
2. In `js/config.js`, add one line to `gallery`:
   ```js
   { before: "civic-before.jpg", after: "civic-after.jpg", caption: "Honda Civic, full exterior" },
   ```
3. Delete the placeholder lines (`placeholder-before-1.svg`...) once you have real photos. You can also delete the placeholder files.

The first two pairs also appear on the home page. If the list is empty, the gallery shows a friendly "coming soon" message instead.

## Replacing the logo

The site uses these files in `images/`:

- `logo-wordmark-300.png` and `logo-wordmark-600.png`: header and footer (transparent background)
- `logo-circle-512.png`: the large round logo on the home page
- `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, and `favicon.ico` in the main folder
- `og-image.jpg` (1200 x 630): the preview picture when the site is shared in texts or social media

Replace any of them with a new file of the **same name and size**. On a Mac you can regenerate them all from one picture of the round logo on a plain background:

```bash
swift tools/make-logo-images.swift images/logo-original.jpg images
```

## Deploying to GitHub Pages (free)

1. Create a free account at github.com and click **New repository**. Name it (for example `ballistic-detailing`), keep it **Public**, and don't add a README. Click **Create repository**.
2. In a terminal in this folder, connect and upload (replace `YOUR-NAME`):
   ```bash
   git remote add origin https://github.com/YOUR-NAME/ballistic-detailing.git
   git push -u origin main
   ```
   (Or use the GitHub Desktop app: File > Add Local Repository, choose this folder, then Publish.)
3. On GitHub, open the repository's **Settings > Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, Branch to **main**, folder **/ (root)**, and click **Save**.
4. After a minute or two the site is live at `https://YOUR-NAME.github.io/ballistic-detailing/`. All links are relative, so it works from that sub-folder address.

To update the site later: edit files, then `git add -A`, `git commit -m "Update"`, `git push`. The site refreshes in a minute or two.

## Cloudflare Pages or Netlify

Both work with no settings:

- **Netlify**: at app.netlify.com choose **Add new site > Deploy manually** and drag this whole folder onto the page. Or connect the GitHub repository; leave the build command empty and the publish directory as `/`.
- **Cloudflare Pages**: in the Cloudflare dashboard go to **Workers & Pages > Create > Pages**, connect the GitHub repository (or upload the folder). Framework preset: **None**, build command: empty, output directory: `/`.

## Connecting a custom domain

1. Buy a domain (for example from Cloudflare, Namecheap or Porkbun).
2. **Replace the placeholder address everywhere.** The site currently uses `https://ballistic-detailing.example.com`. Use your editor's "Find in folder" (or `grep -rl "ballistic-detailing.example.com" .`) and replace it with your real address, such as `https://www.yourdomain.com`, in: `js/config.js`, all six `.html` files, `sitemap.xml` and `robots.txt`.
3. Point the domain at your host:
   - **GitHub Pages**: Settings > Pages > Custom domain, type your domain and Save (this creates a `CNAME` file). At your domain registrar add a `CNAME` record for `www` pointing to `YOUR-NAME.github.io`, and for the bare domain add `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Tick **Enforce HTTPS** once it's available.
   - **Netlify / Cloudflare Pages**: open the site's **Domains** (Custom domains) settings, add your domain, and follow the DNS records it shows you.
4. Optional: submit `https://yourdomain.com/sitemap.xml` in Google Search Console, and create a free Google Business Profile for local search.

## How booking works

The Book page collects the customer's details and, when they tap **Book Now**, opens their messages app with a pre-written text to 978-836-6006 that includes the selected service and asks for a quote. They tap Send to finish. On a computer, **Copy message** copies the text so they can send it from their phone. Nothing is stored on a server and booked times are not tracked; you confirm each request by replying.
