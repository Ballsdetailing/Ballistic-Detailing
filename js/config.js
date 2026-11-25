/* =====================================================================
   BALLISTIC DETAILING: SITE SETTINGS
   ---------------------------------------------------------------------
   This is the ONE file to edit for business info, services, hours,
   gallery photos and the booking text message. Save the file and
   refresh the page to see changes. Keep the commas and quotes intact.
   ===================================================================== */
window.SITE = {

  /* ---------- Business info ---------- */
  business: {
    name: "Ballistic Detailing",
    taglines: ["Cleaner. Shinier. Better.", "Drive Clean. Drive Confident."],
    mobileLine: "We come to you!",
    phoneDisplay: "978-836-6006",   // how the number is shown on the site
    phoneE164: "+19788366006",      // same number, digits only with +1 (used for call/text links)
    instagramHandle: "ballistic_detailing", // without the @
    serviceArea: "Cape Coral & Fort Myers, FL",
    areaCities: ["Cape Coral", "Fort Myers"],
    region: "FL",
    // Your web address (GitHub Pages for now). If you get a custom domain, also find-and-replace it in the
    // .html files, sitemap.xml and robots.txt (see README, "Custom domain").
    siteUrl: "https://ballsdetailing.github.io/Ballistic-Detailing"
  },

  /* ---------- Hours ---------- */
  hours: {
    timezone: "America/New_York",
    open: "08:00",          // 24-hour clock
    close: "23:00",
    latestStart: "22:00",   // latest start time offered for ANY service
    slotMinutes: 30,        // start-time dropdown step
    // true = open that day, false = closed (closed days can't be picked when booking)
    days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }
  },

  /* ---------- Prices ----------
     Prices are stored below but HIDDEN. Change to true to show them on
     package cards. */
  showPrices: false,
  currency: "$",

  /* ---------- Services ----------
     type "detail" = a detail package (Headlight Restoration add-on allowed)
     type "standalone" = a service on its own
     inPackages: true = shown as one of the main package cards */
  timeLabel: "Estimated time:",
  services: [
    {
      id: "exterior",
      name: "Exterior Detail",
      type: "detail",
      inPackages: true,
      price: 80,
      time: "1-4 hours",
      summary: "A deep clean and protective finish for paint, wheels and glass.",
      items: ["Hand Wash", "Wheel & Tire Clean", "Paint Decontamination", "Wax / Sealant Protection", "Windows & Mirrors", "Tire Shine"]
    },
    {
      id: "interior",
      name: "Interior Detail",
      type: "detail",
      inPackages: true,
      price: 80,
      time: "1-4 hours",
      summary: "A top-to-bottom refresh of every surface inside your vehicle.",
      items: ["Vacuum & Dust", "Dash & Console Clean", "Door Panels Cleaned", "Seats Shampooed", "Carpet Deep Clean", "Interior Surface Protection"]
    },
    {
      id: "combo",
      name: "2 for 1 Package (Interior + Exterior)",
      cardTitle: "2 for 1 Package",
      cardSubtitle: "Interior + Exterior",
      type: "detail",
      inPackages: true,
      featured: true,
      badge: "Best Value",
      price: 140,
      time: "1-4 hours",
      summary: "The full treatment, inside and out, in one visit.",
      items: ["Everything in Exterior Detail", "Everything in Interior Detail", "Complete inside & out transformation"]
    },
    {
      id: "headlight",
      name: "Standalone Headlight Service",
      type: "standalone",
      inPackages: false,
      price: 100,
      time: "about 1 hour",
      summary: "Cloudy, yellowed headlights restored to clear, with lasting protection.",
      items: ["3-step sanding", "Ceramic coating"]
    }
  ],

  addon: {
    id: "headlight-restoration",
    name: "Headlight Restoration",
    price: 75,
    summary: "Add it to any detail package for clear, bright headlights."
  },

  vehicleNote: "Trucks and SUVs are welcome. Same service, same care.",

  /* ---------- Gallery: before & after photos ----------
     To add a pair: put two photos in images/before-after/
     and add ONE line below, e.g.
       { before: "civic-before.jpg", after: "civic-after.jpg", caption: "Honda Civic, full exterior" },
     The first pair also shows on the home page. */
  gallery: [
    { before: "placeholder-before-1.svg", after: "placeholder-after-1.svg", caption: "Exterior Detail (photo coming soon)" },
    { before: "placeholder-before-2.svg", after: "placeholder-after-2.svg", caption: "Interior Detail (photo coming soon)" },
    { before: "placeholder-before-3.svg", after: "placeholder-after-3.svg", caption: "Headlight Restoration (photo coming soon)" }
  ],

  /* ---------- Booking text message ----------
     {placeholders} are filled from the form. Edit the wording freely. */
  booking: {
    message: [
      "Hi, I'd like to book with {business} and get a quote.",
      "",
      "Name: {name}",
      "Phone: {phone}",
      "Vehicle: {vehicle}",
      "Service: {service}",
      "Add-on: {addon}",
      "Address: {address}",
      "Preferred date/time: {date} at {time}",
      "Notes: {notes}",
      "",
      "Could you send me a quote?"
    ],
    noneText: "None",
    sendNote: "Tap Send in your messages app to finish your request. We'll text back with a quote and confirm your time.",
    requestNote: "This is a booking request. Your appointment is confirmed once we text you back."
  },

  /* ---------- FAQ ----------
     {area}, {detailTime} and {headlightTime} are filled in automatically.
     An entry with includes: true lists every package's checklist. */
  faq: [
    { q: "What do you need from me?",
      a: "Just access to a water spigot and a standard power outlet near where your vehicle is parked, plus a spot with room to work around it. We bring everything else." },
    { q: "How long does a detail take?",
      a: "Detail packages take about {detailTime}, depending on the package and your vehicle's condition. The standalone headlight service takes {headlightTime}." },
    { q: "Where do you service?",
      a: "We're fully mobile and come to you at home or work anywhere in {area}." },
    { q: "What's included in each package?", includes: true },
    { q: "How do quotes work?",
      a: "Send a booking request from the Book page. It opens a pre-written text to us with your vehicle, service and preferred time. We text you back with a quote and confirm your appointment time. Nothing is booked until we reply." },
    { q: "Do trucks and SUVs cost more?",
      a: "No. Trucks and SUVs are quoted the same as any other vehicle." }
  ]
};
