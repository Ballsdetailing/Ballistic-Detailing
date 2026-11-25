/* Ballistic Detailing: shared page code (header, footer, packages, gallery, FAQ).
   All business details come from js/config.js. */
(function () {
  "use strict";
  var C = window.SITE;
  var B = C.business;
  var page = document.body.getAttribute("data-page") || "";

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtTime(hhmm) {
    var p = hhmm.split(":"), h = +p[0], m = +p[1];
    var ap = h >= 12 && h < 24 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }
  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function daysText() {
    var open = DAY_KEYS.map(function (k) { return !!C.hours.days[k]; });
    var n = open.filter(Boolean).length;
    if (n === 7) return "Open 7 days a week";
    if (n === 0) return "Currently closed";
    // Build ranges in Mon..Sun order, e.g. "Mon–Sat"
    var order = [1, 2, 3, 4, 5, 6, 0], parts = [], i = 0;
    while (i < 7) {
      if (!open[order[i]]) { i++; continue; }
      var j = i;
      while (j + 1 < 7 && open[order[j + 1]]) j++;
      parts.push(i === j ? DAY_SHORT[order[i]] : DAY_SHORT[order[i]] + "–" + DAY_SHORT[order[j]]);
      i = j + 1;
    }
    return parts.join(", ");
  }
  var hoursText = fmtTime(C.hours.open) + " – " + fmtTime(C.hours.close);
  var telHref = "tel:" + B.phoneE164;
  var smsHref = "sms:" + B.phoneE164;
  var igUrl = "https://www.instagram.com/" + B.instagramHandle + "/";
  var detailTime = (C.services.find(function (s) { return s.type === "detail"; }) || {}).time || "";
  var hlService = C.services.find(function (s) { return s.type === "standalone"; });
  function fill(text) {
    return text.replace(/\{area\}/g, B.serviceArea)
      .replace(/\{detailTime\}/g, detailTime)
      .replace(/\{headlightTime\}/g, hlService ? hlService.time : "");
  }
  function priceHtml(price) {
    return C.showPrices && price != null ? '<p class="price">' + esc(C.currency + price) + "</p>" : "";
  }

  /* ---------- icons ---------- */
  var I = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    van: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    arrows: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6-6 6 6 6M15 6l6 6-6 6"/></svg>'
  };
  window.ICONS = I;

  /* ---------- header ---------- */
  var NAV = [
    ["index.html", "Home", "home"], ["packages.html", "Packages", "packages"], ["gallery.html", "Gallery", "gallery"],
    ["faq.html", "FAQ", "faq"], ["contact.html", "Contact", "contact"], ["book.html", "Book", "book"]
  ];
  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="container header-inner">' +
        '<a class="brand" href="index.html" aria-label="' + esc(B.name) + ' home">' +
          '<img src="images/logo-wordmark-300.png" srcset="images/logo-wordmark-300.png 1x, images/logo-wordmark-600.png 2x" width="300" height="103" alt="' + esc(B.name) + '">' +
        "</a>" +
        '<nav class="nav" id="site-nav" aria-label="Main"><ul>' +
          NAV.map(function (n) {
            return '<li><a href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page"' : "") + ">" + n[1] + "</a></li>";
          }).join("") +
        "</ul></nav>" +
        '<div class="header-actions">' +
          '<a class="icon-btn header-call" href="' + telHref + '" aria-label="Call ' + esc(B.phoneDisplay) + '">' + I.phone + '<span class="header-call-text">' + esc(B.phoneDisplay) + "</span></a>" +
          '<a class="btn btn-primary header-book" href="book.html">Book Now</a>' +
          '<button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' + I.menu + "</button>" +
        "</div>" +
      "</div>";
    var btn = header.querySelector(".menu-btn"), nav = header.querySelector(".nav");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      btn.innerHTML = open ? I.close : I.menu;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { btn.click(); btn.focus(); }
    });
  }

  /* ---------- footer ---------- */
  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<a href="index.html" aria-label="' + esc(B.name) + ' home"><img src="images/logo-wordmark-300.png" srcset="images/logo-wordmark-300.png 1x, images/logo-wordmark-600.png 2x" width="300" height="103" alt="' + esc(B.name) + '" loading="lazy" decoding="async"></a>' +
            "<p>" + esc(C.business.taglines[0]) + "</p>" +
          "</div>" +
          "<div><h2>Get in touch</h2><ul>" +
            '<li><a href="' + telHref + '">' + I.phone + "Call " + esc(B.phoneDisplay) + "</a></li>" +
            '<li><a href="' + smsHref + '">' + I.chat + "Text " + esc(B.phoneDisplay) + "</a></li>" +
            '<li><a href="' + igUrl + '" rel="noopener" target="_blank">' + I.ig + "@" + esc(B.instagramHandle) + '<span class="sr-only"> (opens in a new tab)</span></a></li>' +
          "</ul></div>" +
          "<div><h2>Hours &amp; area</h2><ul>" +
            '<li class="line">' + I.clock + "<span>" + esc(hoursText) + "<br>" + esc(daysText()) + "</span></li>" +
            '<li class="line">' + I.pin + "<span>Mobile service in " + esc(B.serviceArea) + "</span></li>" +
          "</ul></div>" +
        "</div>" +
        '<div class="footer-bottom"><span>&copy; ' + new Date().getFullYear() + " " + esc(B.name) + '</span><span>' + esc(C.business.taglines[1]) + "</span></div>" +
      "</div>";
  }

  /* ---------- simple text bindings: <span data-c="phone"></span> ---------- */
  var BIND = {
    name: B.name, phone: B.phoneDisplay, area: B.serviceArea, hours: hoursText, days: daysText(),
    mobile: B.mobileLine, tagline1: B.taglines[0], tagline2: B.taglines[1], ig: "@" + B.instagramHandle,
    detailTime: detailTime, headlightTime: hlService ? hlService.time : "", vehicleNote: C.vehicleNote,
    addonSummary: C.addon.summary
  };
  document.querySelectorAll("[data-c]").forEach(function (n) {
    var v = BIND[n.getAttribute("data-c")]; if (v != null) n.textContent = v;
  });
  document.querySelectorAll("[data-href]").forEach(function (n) {
    var k = n.getAttribute("data-href");
    n.setAttribute("href", k === "tel" ? telHref : k === "sms" ? smsHref : k === "ig" ? igUrl : n.getAttribute("href"));
  });

  /* ---------- package cards ---------- */
  function checklist(items) {
    return '<ul class="checklist">' + items.map(function (i) { return "<li>" + I.check + "<span>" + esc(i) + "</span></li>"; }).join("") + "</ul>";
  }
  function timeHtml(t) { return '<p class="time">' + I.clock + "<span>" + esc(C.timeLabel) + " " + esc(t) + "</span></p>"; }
  function packageCard(s) {
    var title = s.cardTitle || s.name;
    return '<article class="card' + (s.featured ? " card--featured" : "") + '">' +
      (s.badge ? '<span class="badge">' + esc(s.badge) + "</span>" : "") +
      "<h3>" + esc(title) + "</h3>" +
      (s.cardSubtitle ? '<p class="sub">' + esc(s.cardSubtitle) + "</p>" : "") +
      priceHtml(s.price) +
      '<p class="summary">' + esc(s.summary) + "</p>" +
      checklist(s.items) + timeHtml(s.time) +
      "</article>";
  }
  document.querySelectorAll("[data-render='packages']").forEach(function (n) {
    n.innerHTML = C.services.filter(function (s) { return s.inPackages; }).map(packageCard).join("");
  });

  /* ---------- headlight services ---------- */
  document.querySelectorAll("[data-render='headlights']").forEach(function (n) {
    var a = C.addon, s = hlService;
    n.innerHTML =
      '<article class="card hl-card"><span class="tag">Add-on</span><h3>' + esc(a.name) + "</h3>" + priceHtml(a.price) +
        '<p class="summary">' + esc(a.summary) + "</p>" +
        checklist(["Available with Exterior, Interior or 2 for 1", "Select it when you book"]) +
      "</article>" +
      (s ? '<article class="card hl-card"><span class="tag">Standalone</span><h3>' + esc(s.name.replace(/^Standalone /, "")) + "</h3>" + priceHtml(s.price) +
        '<p class="summary">' + esc(s.summary) + "</p>" + checklist(s.items) + timeHtml(s.time) + "</article>" : "");
  });

  /* ---------- before / after slider ---------- */
  function baFigure(p, idx, eager) {
    var dir = "images/before-after/";
    var lz = eager ? "" : ' loading="lazy"';
    return '<figure class="ba">' +
      '<div class="ba-frame">' +
        '<img class="ba-before" src="' + dir + esc(p.before) + '" alt="Before: ' + esc(p.caption) + '" width="1200" height="900" decoding="async"' + lz + ">" +
        '<img class="ba-after" src="' + dir + esc(p.after) + '" alt="After: ' + esc(p.caption) + '" width="1200" height="900" decoding="async"' + lz + ">" +
        '<span class="ba-label ba-label--before" aria-hidden="true">Before</span><span class="ba-label ba-label--after" aria-hidden="true">After</span>' +
        '<span class="ba-line"></span><span class="ba-knob">' + I.arrows + "</span>" +
        '<input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Slide to compare before and after, ' + esc(p.caption) + '">' +
      "</div>" +
      "<figcaption>" + esc(p.caption) + "</figcaption>" +
    "</figure>";
  }
  document.querySelectorAll("[data-render='gallery']").forEach(function (n) {
    var limit = +n.getAttribute("data-limit") || C.gallery.length;
    var pairs = C.gallery.slice(0, limit);
    n.innerHTML = pairs.length ? pairs.map(function (p, i) { return baFigure(p, i, false); }).join("")
      : '<p class="ba-empty">Before &amp; after photos are coming soon. Follow us on Instagram for our latest work.</p>';
    n.querySelectorAll(".ba-range").forEach(function (r) {
      var frame = r.closest(".ba-frame");
      var update = function () { frame.style.setProperty("--pos", r.value + "%"); };
      r.addEventListener("input", update); update();
    });
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll("[data-render='faq']").forEach(function (n) {
    n.innerHTML = C.faq.map(function (f) {
      var body = f.includes
        ? C.services.map(function (s) {
            return "<h4>" + esc(s.name) + "</h4><ul>" + s.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
          }).join("") + "<h4>" + esc(C.addon.name) + " (add-on)</h4><p>" + esc(C.addon.summary) + "</p>"
        : "<p>" + esc(fill(f.a)) + "</p>";
      return "<details><summary>" + esc(f.q) + '</summary><div class="answer">' + body + "</div></details>";
    }).join("");
  });

  /* ---------- LocalBusiness structured data ---------- */
  var openDays = DAY_KEYS.map(function (k, i) { return C.hours.days[k] ? DAY_NAMES[i] : null; }).filter(Boolean);
  var ld = {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    "name": B.name,
    "description": "Mobile car detailing in " + B.serviceArea + ". " + B.mobileLine,
    "url": B.siteUrl + "/",
    "logo": B.siteUrl + "/images/logo-circle-512.png",
    "image": B.siteUrl + "/images/og-image.jpg",
    "telephone": B.phoneE164,
    "areaServed": B.areaCities.map(function (c) { return { "@type": "City", "name": c + ", " + B.region }; }),
    "address": { "@type": "PostalAddress", "addressLocality": B.areaCities[0], "addressRegion": B.region, "addressCountry": "US" },
    "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": openDays, "opens": C.hours.open, "closes": C.hours.close }],
    "sameAs": [igUrl]
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);

  /* expose helpers for book.js */
  window.SITE_UTIL = { esc: esc, fmtTime: fmtTime, DAY_KEYS: DAY_KEYS, DAY_NAMES: DAY_NAMES };
})();
