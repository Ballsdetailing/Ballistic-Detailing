/* Ballistic Detailing: booking request form.
   Builds a pre-written text message and opens the customer's messaging app.
   Nothing is sent to a server; wording lives in js/config.js (booking.message). */
(function () {
  "use strict";
  var C = window.SITE, B = C.business, U = window.SITE_UTIL;
  var form = document.getElementById("book-form");
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };
  var f = {
    name: $("f-name"), phone: $("f-phone"), vehicle: $("f-vehicle"), service: $("f-service"),
    addon: $("f-addon"), address: $("f-address"), date: $("f-date"), time: $("f-time"), notes: $("f-notes")
  };
  var addonWrap = $("addon-wrap"), est = $("f-est"), summary = $("form-summary"), status = $("form-status");
  var preview = $("msg-preview");

  /* ---------- time zone helpers (business time, not the visitor's) ---------- */
  function nowInTz() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: C.hours.timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + "-" + o.month + "-" + o.day, minutes: (+o.hour % 24) * 60 + +o.minute };
  }
  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function minToHHMM(m) { var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
  function parseDate(v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function prettyDate(v) {
    return parseDate(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  function isOpenDay(v) { return !!C.hours.days[U.DAY_KEYS[parseDate(v).getDay()]]; }
  function addDays(v, n) {
    var d = parseDate(v); d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---------- populate service dropdown ---------- */
  C.services.forEach(function (s) {
    var o = document.createElement("option"); o.value = s.id; o.textContent = s.name; f.service.appendChild(o);
  });
  $("addon-name").textContent = C.addon.name;
  $("addon-summary").textContent = C.addon.summary;
  function svc() { return C.services.find(function (s) { return s.id === f.service.value; }); }
  function onService() {
    var s = svc();
    est.innerHTML = s ? window.ICONS.clock + "<span>" + U.esc(C.timeLabel + " " + s.time) + "</span>" : "";
    var allowAddon = s && s.type === "detail";
    addonWrap.hidden = !allowAddon;
    if (!allowAddon) f.addon.checked = false;
  }
  f.service.addEventListener("change", onService);

  /* ---------- date: earliest = first open day from today ---------- */
  $("send-note").textContent = C.booking.sendNote;
  $("request-note").textContent = C.booking.requestNote;
  var today = nowInTz().date;
  f.date.min = today;
  f.date.max = addDays(today, 365);
  var closedNames = U.DAY_KEYS.map(function (k, i) { return C.hours.days[k] ? null : U.DAY_NAMES[i] + "s"; }).filter(Boolean);
  if (closedNames.length) $("date-hint").textContent = "We're closed on " + closedNames.join(", ") + ".";

  /* ---------- start time dropdown ---------- */
  function buildTimes() {
    var keep = f.time.value;
    var start = toMin(C.hours.open), last = Math.min(toMin(C.hours.latestStart), toMin(C.hours.close));
    var earliest = start;
    var n = nowInTz();
    if (f.date.value && f.date.value === n.date) {
      // Same-day: only offer times at least an hour from now
      var soon = n.minutes + 60;
      earliest = Math.max(start, Math.ceil(soon / C.hours.slotMinutes) * C.hours.slotMinutes);
    }
    f.time.innerHTML = '<option value="">Choose a start time</option>';
    var count = 0;
    for (var m = earliest; m <= last; m += C.hours.slotMinutes) {
      var v = minToHHMM(m), o = document.createElement("option");
      o.value = v; o.textContent = U.fmtTime(v); f.time.appendChild(o); count++;
    }
    if (count === 0) {
      var o2 = document.createElement("option"); o2.value = ""; o2.disabled = true;
      o2.textContent = "No times left today, please pick another date"; f.time.appendChild(o2);
    }
    if (keep && f.time.querySelector('option[value="' + keep + '"]')) f.time.value = keep;
  }
  f.date.addEventListener("change", function () { buildTimes(); validateField("date"); });
  buildTimes();
  $("time-hint").textContent = "Latest start time is " + U.fmtTime(C.hours.latestStart) + ".";

  /* ---------- validation ---------- */
  function digits(v) { return v.replace(/\D/g, ""); }
  var rules = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
    phone: function (v) {
      var d = digits(v);
      if (!d) return "Please enter your phone number so we can text you back.";
      if (d.length === 11 && d[0] === "1") d = d.slice(1);
      return d.length === 10 ? "" : "Please enter a 10-digit phone number, like 239-555-0123.";
    },
    vehicle: function (v) { return v.trim().length >= 3 ? "" : "Please tell us the year, make and model (for example 2021 Toyota Tacoma)."; },
    service: function (v) { return v ? "" : "Please choose a service."; },
    address: function (v) { return v.trim().length >= 5 ? "" : "Please enter the address where we'll detail your vehicle."; },
    date: function (v) {
      if (!v) return "Please pick a preferred date.";
      if (v < today) return "That date has passed. Please pick today or a later date.";
      if (v > f.date.max) return "Please pick a date within the next year.";
      if (!isOpenDay(v)) return "We're closed on " + U.DAY_NAMES[parseDate(v).getDay()] + "s. Please pick another day.";
      return "";
    },
    time: function (v) { return v ? "" : "Please choose a preferred start time."; }
  };
  function validateField(k) {
    var msg = rules[k](f[k].value);
    var wrap = f[k].closest(".field"), err = wrap.querySelector(".err");
    err.textContent = msg;
    if (msg) { wrap.setAttribute("data-invalid", ""); f[k].setAttribute("aria-invalid", "true"); }
    else { wrap.removeAttribute("data-invalid"); f[k].removeAttribute("aria-invalid"); }
    return !msg;
  }
  Object.keys(rules).forEach(function (k) {
    f[k].addEventListener("blur", function () { if (f[k].value) validateField(k); });
    f[k].addEventListener("change", function () { if (f[k].closest(".field").hasAttribute("data-invalid")) validateField(k); });
    f[k].addEventListener("input", function () { if (f[k].closest(".field").hasAttribute("data-invalid")) validateField(k); });
  });
  function validateAll() {
    var bad = Object.keys(rules).filter(function (k) { return !validateField(k); });
    if (bad.length) {
      summary.hidden = false;
      summary.textContent = bad.length === 1 ? "Please fix 1 field above before sending." : "Please fix " + bad.length + " fields above before sending.";
      f[bad[0]].focus();
      return false;
    }
    summary.hidden = true;
    return true;
  }

  /* ---------- the message (wording is in config.booking.message) ---------- */
  function buildMessage() {
    var s = svc(), none = C.booking.noneText;
    var vals = {
      business: B.name,
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      vehicle: f.vehicle.value.trim(),
      service: s ? s.name : "",
      addon: f.addon.checked && !addonWrap.hidden ? C.addon.name : none,
      address: f.address.value.trim(),
      date: f.date.value ? prettyDate(f.date.value) : "",
      time: f.time.value ? U.fmtTime(f.time.value) : "",
      notes: f.notes.value.trim() || none
    };
    return C.booking.message.map(function (line) {
      return line.replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ""; });
    }).join("\n");
  }

  /* iOS uses "&body=", Android and others use "?body=" */
  function isIOS() {
    if (/Android/i.test(navigator.userAgent)) return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  function smsLink(body) {
    return "sms:" + B.phoneE164 + (isIOS() ? "&" : "?") + "body=" + encodeURIComponent(body);
  }
  window.BOOKING = { buildMessage: buildMessage, smsLink: smsLink }; // handy for testing

  function updatePreview() { preview.textContent = buildMessage(); }
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  onService(); updatePreview();

  /* ---------- Book Now: open messages app ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    if (!validateAll()) return;
    var link = smsLink(buildMessage());
    status.textContent = "Opening your messages app… Tap Send to finish your request.";
    window.location.href = link;
  });

  /* ---------- Copy message ---------- */
  var copyBtn = $("copy-btn"), copyLabel = copyBtn.querySelector("span");
  copyBtn.addEventListener("click", function () {
    status.textContent = "";
    if (!validateAll()) return;
    var text = buildMessage();
    var done = function () {
      copyLabel.textContent = "Copied!";
      status.textContent = "Message copied. Paste it into a text to " + B.phoneDisplay + " and send.";
      setTimeout(function () { copyLabel.textContent = "Copy message"; }, 2500);
    };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); }
      catch (err) { status.textContent = "Couldn't copy automatically. Open “Preview your message” and copy it from there."; }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  });
})();
