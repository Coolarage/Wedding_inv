/**
 * Three-act scroll story — one scroll/swipe = next act, animations on entry.
 * Acts 1–2 are locked to full viewport; Act 3 scrolls freely on mobile.
 */
(function () {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const mobileQuery = window.matchMedia("(max-width: 719px)");

  const CELEBRATION = {
    1: { emojis: ["💍", "✨", "💕", "🌸", "💫"], count: 28 },
    2: { emojis: ["🎉", "🥂", "✨", "🎊", "⭐"], count: 32 },
    3: { emojis: ["💖", "📸", "💕", "🌹", "✨"], count: 26 },
  };

  const SCROLL_LOCK_MS = reducedMotion ? 0 : 780;
  const SWIPE_MIN = 42;

  let acts = [];
  let activeIndex = 0;
  let scrollLocked = false;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;

  function init() {
    acts = Array.from(document.querySelectorAll(".scroll-act"));
    if (!acts.length) return;

    document.body.classList.add("scroll-story");
    buildActNav();
    bindScrollHints();
    bindWheel();
    bindTouch();
    bindKeys();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncTallActScrollMode, { passive: true });

    if (reducedMotion) {
      acts.forEach((act) => act.classList.add("is-active", "is-seen"));
      activeIndex = 0;
      updateNav("1");
      return;
    }

    primeFirstAct();
  }

  function primeFirstAct() {
    activeIndex = 0;
    acts.forEach((act, i) => {
      act.classList.toggle("is-active", i === 0);
      act.classList.remove("is-seen", "is-replaying");
    });
    updateNav("1");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => playEntrance(acts[0]));
    });
  }

  function bindScrollHints() {
    document.querySelectorAll(".scroll-hint[href^='#act-']").forEach((hint) => {
      hint.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(hint.getAttribute("href"));
        const index = acts.indexOf(target);
        if (index >= 0) goToAct(index);
      });
    });
  }

  function bindWheel() {
    window.addEventListener(
      "wheel",
      (e) => {
        if (reducedMotion) return;

        if (scrollLocked) {
          e.preventDefault();
          return;
        }

        if (e.deltaY === 0) return;

        const dir = e.deltaY > 0 ? 1 : -1;
        const idx = getCurrentActIndex();

        if (allowNativeScroll(idx, dir)) return;

        e.preventDefault();
        const next = clamp(idx + dir, 0, acts.length - 1);
        if (next !== idx) goToAct(next);
      },
      { passive: false }
    );
  }

  function bindTouch() {
    window.addEventListener(
      "touchstart",
      (e) => {
        if (reducedMotion || scrollLocked) return;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (reducedMotion || scrollLocked) return;

        const idx = getCurrentActIndex();
        const touch = e.touches[0];
        const deltaY = touchStartY - touch.clientY;
        const deltaX = touchStartX - touch.clientX;

        if (Math.abs(deltaY) < Math.abs(deltaX)) return;

        if (idx === 2 && !allowNativeScroll(idx, deltaY > 0 ? 1 : -1)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    window.addEventListener(
      "touchend",
      (e) => {
        if (reducedMotion || scrollLocked) return;

        const touch = e.changedTouches[0];
        const deltaY = touchStartY - touch.clientY;
        const deltaX = touchStartX - touch.clientX;
        const elapsed = Date.now() - touchStartTime;

        if (Math.abs(deltaY) < SWIPE_MIN || Math.abs(deltaY) < Math.abs(deltaX)) return;
        if (elapsed > 700) return;

        const dir = deltaY > 0 ? 1 : -1;
        const idx = getCurrentActIndex();

        if (allowNativeScroll(idx, dir)) return;

        const next = clamp(idx + dir, 0, acts.length - 1);
        if (next !== idx) goToAct(next);
      },
      { passive: true }
    );
  }

  function bindKeys() {
    window.addEventListener("keydown", (e) => {
      if (reducedMotion || scrollLocked) return;
      if (e.target.closest("input, textarea, select")) return;

      let dir = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") dir = 1;
      if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      if (!dir) return;

      if (e.key === " ") e.preventDefault();

      const idx = getCurrentActIndex();
      if (allowNativeScroll(idx, dir)) return;

      const next = clamp(idx + dir, 0, acts.length - 1);
      if (next !== idx) {
        e.preventDefault();
        goToAct(next);
      }
    });
  }

  function onScroll() {
    if (reducedMotion) return;

    syncTallActScrollMode();

    if (scrollLocked) return;

    const idx = getCurrentActIndex();
    if (idx !== activeIndex) {
      setActiveAct(idx, { play: true });
    }
  }

  function goToAct(index, opts = {}) {
    const { instant = false, force = false } = opts;
    const act = acts[index];
    if (!act) return;
    if (!force && scrollLocked && index === activeIndex) return;

    scrollLocked = !instant && SCROLL_LOCK_MS > 0;
    activeIndex = index;

    acts.forEach((a, i) => {
      a.classList.toggle("is-active", i === index);
      if (i !== index) a.classList.remove("is-replaying");
    });
    updateNav(act.dataset.act || String(index + 1));

    act.classList.remove("is-seen", "is-replaying");
    void act.offsetWidth;

    act.scrollIntoView({
      behavior: instant || reducedMotion ? "auto" : "smooth",
      block: "start",
    });

    const triggerEntrance = () => playEntrance(act);
    if (instant) {
      requestAnimationFrame(() => requestAnimationFrame(triggerEntrance));
    } else {
      setTimeout(triggerEntrance, 120);
    }

    if (scrollLocked) {
      setTimeout(() => {
        scrollLocked = false;
        syncTallActScrollMode();
      }, SCROLL_LOCK_MS);
    } else {
      syncTallActScrollMode();
    }
  }

  function setActiveAct(index, { play = false } = {}) {
    activeIndex = index;
    acts.forEach((act, i) => {
      act.classList.toggle("is-active", i === index);
    });

    if (play) {
      playEntrance(acts[index]);
    }

    updateNav(acts[index]?.dataset.act || String(index + 1));
  }

  function playEntrance(act) {
    if (!act) return;

    act.classList.add("is-seen");

    if (!act.classList.contains("is-entering")) {
      act.classList.add("is-entering");
    } else {
      act.classList.remove("is-replaying");
      void act.offsetWidth;
      act.classList.add("is-replaying");
    }

    launchCelebration(act, act.dataset.act);
  }

  function getCurrentActIndex() {
    let best = 0;
    let bestRatio = -1;

    acts.forEach((act, i) => {
      const rect = act.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = visible / window.innerHeight;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = i;
      }
    });

    return best;
  }

  function allowNativeScroll(actIndex, dir) {
    const act = acts[actIndex];
    if (!act || actIndex === 0) return false;

    const actTall = act.offsetHeight > window.innerHeight + 16;
    if (!actTall) return false;

    const scrollTop = window.scrollY;
    const actTop = act.offsetTop;
    const actBottom = actTop + act.offsetHeight;
    const viewBottom = scrollTop + window.innerHeight;
    const atTop = scrollTop <= actTop + 8;
    const atBottom = viewBottom >= actBottom - 8;

    if (dir > 0) return !atBottom;
    return !atTop;
  }

  function syncTallActScrollMode() {
    const root = document.documentElement;
    if (!mobileQuery.matches) {
      root.classList.remove("scroll-free-act3", "scroll-free-tall");
      return;
    }

    let deepInTallAct = false;
    for (let i = 1; i < acts.length; i++) {
      const act = acts[i];
      if (act.offsetHeight <= window.innerHeight + 16) continue;
      const rect = act.getBoundingClientRect();
      if (rect.top < -24 && rect.bottom > window.innerHeight * 0.35) {
        deepInTallAct = true;
        break;
      }
    }

    root.classList.toggle("scroll-free-act3", deepInTallAct);
    root.classList.toggle("scroll-free-tall", deepInTallAct);
  }

  function buildActNav() {
    if (document.querySelector(".act-nav")) return;

    const nav = document.createElement("nav");
    nav.className = "act-nav";
    nav.setAttribute("aria-label", "Story sections");

    acts.forEach((act, index) => {
      const num = act.dataset.act;
      const btn = document.createElement("a");
      btn.className = "act-nav-dot";
      btn.href = `#act-${num}`;
      btn.dataset.act = num;
      btn.setAttribute("aria-label", `Section ${num}`);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        goToAct(index);
      });
      nav.appendChild(btn);
    });

    document.body.appendChild(nav);
  }

  function updateNav(activeAct) {
    document.querySelectorAll(".act-nav-dot").forEach((dot) => {
      dot.classList.toggle("is-active", dot.dataset.act === activeAct);
    });
  }

  function launchCelebration(act, actNum) {
    const layer = act.querySelector(".act-burst");
    if (!layer) return;

    layer.replaceChildren();

    const cfg = CELEBRATION[actNum] || CELEBRATION[1];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < cfg.count; i++) {
      const p = document.createElement("span");
      p.className = "burst-particle";
      p.textContent = cfg.emojis[i % cfg.emojis.length];
      p.style.setProperty("--bx", `${random(-140, 140)}px`);
      p.style.setProperty("--by", `${random(80, 220)}px`);
      p.style.setProperty("--rot", `${random(-180, 180)}deg`);
      p.style.setProperty("--delay", `${random(0, 400)}ms`);
      p.style.setProperty("--dur", `${random(900, 1600)}ms`);
      p.style.left = `${random(8, 92)}%`;
      p.style.top = `${random(15, 55)}%`;
      fragment.appendChild(p);
    }

    layer.appendChild(fragment);
    setTimeout(() => layer.replaceChildren(), 2200);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
