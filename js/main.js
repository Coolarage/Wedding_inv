(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const inviteCopy = window.INVITATION_COPY || {};
  const ui = window.UI_COPY || {};

  const pageLang =
    document.documentElement.getAttribute("data-invite-lang") || "ar";
  const isSpecial =
    document.documentElement.getAttribute("data-invite-type") === "special";
  const copy = inviteCopy[pageLang] || inviteCopy.ar;
  const enCopy = inviteCopy.en || {};
  const arCopy = inviteCopy.ar || {};

  const assetRoot = isSpecial ? ".." : ".";

  const weddingDate = new Date(cfg.date || "2026-09-30T18:00:00+03:00");
  const STACK_VISIBLE = 3;
  const STACK_INTERVAL_MS = 2000;
  const STACK_EXIT_MS = 360;
  const STACK_STAGGER_MS = 900;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const galleryTimers = [];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function photoUrl(filename) {
    return `${assetRoot}/assets/photos/${encodeURIComponent(filename)}`;
  }

  function fillLyricsContainer(container, lines) {
    if (!container) return;
    container.replaceChildren(
      ...(lines || []).map((line) => {
        const span = document.createElement("span");
        span.className = "lyrics-line";
        span.textContent = line;
        return span;
      })
    );
  }

  function getNames() {
    if (pageLang === "en" || isSpecial) {
      const groom = cfg.groomEn || "Mohab";
      const bride = cfg.brideEn || "Hams";
      return {
        heroGroom: groom,
        heroBride: bride,
        display: `${groom} & ${bride}`,
      };
    }
    const groom = cfg.groom || "مهاب";
    const bride = cfg.bride || "همس";
    const join = copy.footerNamesJoin || " و ";
    return {
      heroGroom: groom,
      heroBride: bride,
      display: `${groom}${join}${bride}`,
    };
  }

  function applyUiChrome() {
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set("countdown-heading", ui.countdownTitle || "Countdown");
    document.querySelector('[data-ui="days"]').textContent = ui.days || "Days";
    document.querySelector('[data-ui="hours"]').textContent = ui.hours || "Hours";
    document.querySelector('[data-ui="minutes"]').textContent =
      ui.minutes || "Minutes";
    document.querySelector('[data-ui="seconds"]').textContent =
      ui.seconds || "Seconds";
    set("details-heading", ui.detailsTitle || "Celebration details");
    document.querySelector('[data-ui="labelDate"]').textContent =
      ui.labelDate || "Date";
    document.querySelector('[data-ui="labelVenue"]').textContent =
      ui.labelVenue || "Venue";
    set("maps-link", ui.openMaps || "Open location in Maps");
    set("gallery-heading", ui.galleryTitle || "Our memories");
    set("gallery-lead", ui.galleryLead || "A little stack of our favorite moments");
    set("stack-label-left", ui.stackLabelLeft || "💕");
    set("stack-label-right", ui.stackLabelRight || "✨");
    set(
      "photo-stack-hint",
      ui.stackTapHint || "Memories shuffle automatically"
    );
    set("scroll-hint-1", ui.scrollHint1 || "Scroll to celebrate");
    set("scroll-hint-2", ui.scrollHint2 || "Our memories await");
    set("back-to-top", ui.backToTop || "Back to top");
    applyRsvpLabels();
  }

  function applyRsvpLabels() {
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el && text) el.textContent = text;
    };
    set("rsvp-heading", copy.rsvpTitle);
    set("rsvp-lead", copy.rsvpLead);
    set("rsvp-label-name", copy.rsvpName);
    set("rsvp-label-attending", copy.rsvpAttending);
    set("rsvp-attending-yes", copy.rsvpAttendingYes);
    set("rsvp-attending-no", copy.rsvpAttendingNo);
    set("rsvp-label-plus-one", copy.rsvpPlusOne);
    set("rsvp-plus-one-yes", copy.rsvpPlusOneYes);
    set("rsvp-plus-one-no", copy.rsvpPlusOneNo);
    set("rsvp-label-message", copy.rsvpMessage);
    set("rsvp-submit", copy.rsvpSubmit);
  }

  function applySpecialPage() {
    document.body.classList.add("is-special-invite");

    const guestName =
      document.documentElement.getAttribute("data-guest-name") || "";
    const guestMessage =
      document.documentElement.getAttribute("data-guest-message") || "";
    const eyebrow = document.getElementById("hero-eyebrow");

    if (eyebrow) {
      if (guestMessage) {
        eyebrow.textContent = guestMessage;
      } else if (guestName) {
        eyebrow.textContent = `💌 ${guestName}, you're invited to share our joy`;
      } else {
        eyebrow.textContent = enCopy.eyebrow || copy.eyebrow;
      }
    }

    const taglineEl = document.getElementById("hero-tagline");
    if (taglineEl) {
      taglineEl.textContent = enCopy.tagline || copy.tagline || "";
      taglineEl.hidden = false;
    }

    const singleLyrics = document.getElementById("hero-lyrics");
    if (singleLyrics) singleLyrics.hidden = true;

    set("dual-lyrics-title-ar", ui.dualLyricsTitleAr || "🎵 أغنيتنا");
    set("dual-lyrics-title-en", ui.dualLyricsTitleEn || "🎵 Our song");
    fillLyricsContainer(
      document.getElementById("lyrics-ar-text"),
      arCopy.lyricsLines
    );
    fillLyricsContainer(
      document.getElementById("lyrics-en-text"),
      enCopy.lyricsLines
    );

    document.getElementById("footer-line").textContent =
      enCopy.footerLine || copy.footerLine;
  }

  function set(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
  }

  function applyPage() {
    document.documentElement.lang = copy.lang;
    document.documentElement.dir = copy.dir;
    document.body.classList.toggle("is-rtl", copy.dir === "rtl");
    document.body.classList.toggle("is-ltr", copy.dir === "ltr");

    document.title = isSpecial
      ? `${cfg.groomEn || "Mohab"} & ${cfg.brideEn || "Hams"} — Special Invitation`
      : copy.documentTitle;
    const meta = document.getElementById("meta-description");
    if (meta) meta.content = copy.metaDescription;

    if (isSpecial) {
      applySpecialPage();
    } else {
      document.getElementById("hero-eyebrow").textContent = copy.eyebrow;

      const taglineEl = document.getElementById("hero-tagline");
      if (taglineEl) {
        if (copy.tagline) {
          taglineEl.textContent = copy.tagline;
          taglineEl.hidden = false;
        } else {
          taglineEl.textContent = "";
          taglineEl.hidden = true;
        }
      }

      const lyricsBlock = document.getElementById("hero-lyrics");
      const lyricsText = document.getElementById("hero-lyrics-text");
      const lines = Array.isArray(copy.lyricsLines) ? copy.lyricsLines : [];
      if (lyricsBlock && lyricsText) {
        if (lines.length > 0) {
          fillLyricsContainer(lyricsText, lines);
          lyricsBlock.hidden = false;
        } else {
          lyricsText.replaceChildren();
          lyricsBlock.hidden = true;
        }
      }

      document.getElementById("footer-line").textContent = copy.footerLine;
    }

    const footerEmoji = document.getElementById("footer-emoji");
    if (footerEmoji) footerEmoji.textContent = copy.footerEmoji || "💕";

    const eventEn = cfg.eventEn || {};
    const eventAr = cfg.eventAr || {};
    const dateLine = isSpecial
      ? eventEn.dateLine || "Wednesday · 30 September 2026"
      : pageLang === "ar"
        ? eventAr.dateLine || "الأربعاء · ٣٠ سبتمبر ٢٠٢٦"
        : eventEn.dateLine || "Wednesday · 30 September 2026";
    const dateDetail = isSpecial
      ? eventEn.dateDetail || "30 / 9 / 2026"
      : pageLang === "ar"
        ? eventAr.dateDetail || "٣٠ / ٩ / ٢٠٢٦"
        : eventEn.dateDetail || "30 / 9 / 2026";

    const weddingDateEl = document.getElementById("wedding-date");
    weddingDateEl.textContent = dateLine;
    weddingDateEl.lang = isSpecial || pageLang === "en" ? "en" : "ar";
    document.getElementById("detail-date").textContent = dateDetail;
    document.getElementById("detail-date").lang =
      isSpecial || pageLang === "en" ? "en" : "ar";

    const names = getNames();
    document.getElementById("groom-name").textContent = names.heroGroom;
    document.getElementById("bride-name").textContent = names.heroBride;
    document.getElementById("footer-names").textContent = names.display;

    const venue = cfg.venue || {};
    document.getElementById("venue-name").textContent =
      venue.nameEn || "La Terrace, JW Marriott";
    document.getElementById("venue-area").textContent =
      venue.areaEn || "Fifth Settlement, Cairo";

    const quran = cfg.quranVerse;
    const quranText = document.getElementById("quran-text");
    const quranRef = document.getElementById("quran-ref");
    if (quran && quranText && quranRef) {
      quranText.textContent = quran.text;
      quranText.lang = "ar";
      quranRef.textContent = `📖 ${quran.ref}`;
    }

    const maps = document.getElementById("maps-link");
    if (maps && venue.mapsUrl) maps.href = venue.mapsUrl;

    initPhotoGallery();
  }

  function updateCountdown() {
    const now = Date.now();
    let diff = weddingDate.getTime() - now;
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");

    if (diff <= 0) {
      daysEl.textContent = "0";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 60 * 60 * 1000;
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * 60 * 1000;
    const secs = Math.floor(diff / 1000);

    daysEl.textContent = String(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  function splitPhotos(photos) {
    const mid = Math.ceil(photos.length / 2);
    return {
      left: photos.slice(0, mid),
      right: photos.slice(mid),
    };
  }

  function clearGalleryTimers() {
    galleryTimers.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
    });
    galleryTimers.length = 0;
  }

  function applyStackPositions(cards, topIndex, total) {
    cards.forEach((card, i) => {
      const pos = (i - topIndex + total) % total;
      card.dataset.pos = String(pos);
      card.classList.toggle("is-top", pos === 0);
      card.classList.remove("is-exiting");
      card.setAttribute("aria-hidden", pos >= STACK_VISIBLE ? "true" : "false");
    });
  }

  function updateStackDots(dots, topIndex) {
    dots.forEach((dot, i) => {
      const active = i === topIndex;
      dot.classList.toggle("is-active", active);
      dot.style.setProperty("--dot-delay", "0ms");
      if (active) {
        dot.style.animation = "none";
        void dot.offsetWidth;
        dot.style.animation = "";
      }
    });
  }

  function buildStack(stage, dotsWrap, files, altPrefix, side) {
    stage.replaceChildren();
    dotsWrap.replaceChildren();

    if (files.length === 0) {
      return null;
    }

    const cards = files.map((file, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "photo-stack-card";
      card.setAttribute(
        "aria-label",
        `${altPrefix} ${index + 1} of ${files.length}`
      );

      const frame = document.createElement("div");
      frame.className = "photo-stack-frame";
      const shine = document.createElement("div");
      shine.className = "photo-stack-shine";
      shine.setAttribute("aria-hidden", "true");

      const img = document.createElement("img");
      img.src = photoUrl(file);
      img.alt = `${altPrefix} ${index + 1}`;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";

      frame.appendChild(img);
      frame.appendChild(shine);
      card.appendChild(frame);
      stage.appendChild(card);
      return card;
    });

    const dots = files.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "photo-stack-dot";
      dot.setAttribute("aria-label", `Photo ${index + 1}`);
      dotsWrap.appendChild(dot);
      return dot;
    });

    const state = {
      stage,
      cards,
      dots,
      topIndex: 0,
      total: files.length,
      busy: false,
      timer: null,
      side,
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.busy || state.total < 2) return;
        jumpStack(state, index);
        restartStackAutoplay(state);
      });
    });

    applyStackPositions(cards, 0, files.length);
    updateStackDots(dots, 0);

    stage.addEventListener("click", (e) => {
      if (!e.target.closest(".photo-stack-card.is-top")) return;
      if (state.busy || state.total < 2) return;
      advanceStack(state);
      restartStackAutoplay(state);
    });

    stage.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (state.busy || state.total < 2) return;
        advanceStack(state);
        restartStackAutoplay(state);
      }
    });

    return state;
  }

  function jumpStack(state, index) {
    state.topIndex = index;
    applyStackPositions(state.cards, state.topIndex, state.total);
    updateStackDots(state.dots, state.topIndex);
  }

  function advanceStack(state) {
    if (state.busy || state.total < 2) return;
    state.busy = true;

    const topCard = state.cards[state.topIndex];
    topCard.classList.add("is-exiting");

    const finish = () => {
      topCard.classList.remove("is-exiting");
      state.topIndex = (state.topIndex + 1) % state.total;
      applyStackPositions(state.cards, state.topIndex, state.total);
      updateStackDots(state.dots, state.topIndex);
      state.busy = false;
    };

    if (reducedMotion) {
      finish();
      return;
    }

    setTimeout(finish, STACK_EXIT_MS);
  }

  function startStackAutoplay(state, delayMs) {
    if (state.timer) clearInterval(state.timer);
    if (state.total < 2) return;

    const start = () => {
      state.timer = setInterval(() => advanceStack(state), STACK_INTERVAL_MS);
      galleryTimers.push(state.timer);
    };

    if (delayMs > 0) {
      const t = setTimeout(start, delayMs);
      galleryTimers.push(t);
    } else {
      start();
    }
  }

  function restartStackAutoplay(state) {
    if (state.timer) clearInterval(state.timer);
    startStackAutoplay(state, 0);
  }

  function initPhotoGallery() {
    clearGalleryTimers();

    const gallery = document.getElementById("photo-gallery");
    const leftStage = document.querySelector('[data-stack-stage="left"]');
    const rightStage = document.querySelector('[data-stack-stage="right"]');
    const leftDots = document.querySelector('[data-stack-dots="left"]');
    const rightDots = document.querySelector('[data-stack-dots="right"]');

    if (!gallery || !leftStage || !rightStage) return;

    const photos = Array.isArray(cfg.photos) ? cfg.photos : [];
    if (photos.length === 0) {
      gallery.hidden = true;
      return;
    }

    gallery.hidden = false;
    const altPrefix = copy.photoAltPrefix || "Photo";
    const { left, right } = splitPhotos(photos);

    const leftCol = leftStage.closest(".photo-stack-column");
    const rightCol = rightStage.closest(".photo-stack-column");

    const leftState = buildStack(leftStage, leftDots, left, altPrefix, "left");
    const rightState = buildStack(
      rightStage,
      rightDots,
      right,
      altPrefix,
      "right"
    );

    if (leftCol) leftCol.hidden = !leftState;
    if (rightCol) rightCol.hidden = !rightState;

    if (leftState) {
      if (leftState.total < 2) leftDots.hidden = true;
      startStackAutoplay(leftState, 0);
    }
    if (rightState) {
      if (rightState.total < 2) rightDots.hidden = true;
      startStackAutoplay(
        rightState,
        reducedMotion ? 0 : STACK_STAGGER_MS
      );
    }
  }

  applyUiChrome();
  applyPage();
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
