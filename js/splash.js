(function () {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const SHOW_MS = 3200;
  const FADE_MS = 900;

  function shouldRun() {
    return document.body.classList.contains("landing-page");
  }

  function splashCopy() {
    const cfg = window.WEDDING_CONFIG || {};
    return {
      logo: cfg.logo || "assets/logo/mh-monogram.png",
      logoDark: cfg.logoDark || "assets/logo/mh-monogram-glow.png",
      names: `${cfg.groomEn || "Mohab"} & ${cfg.brideEn || "Hams"}`,
      date: cfg.eventEn?.dateLine || "Wednesday · 30 September 2026",
    };
  }

  function build() {
    if (document.getElementById("splash") || !shouldRun()) return;

    const splash = document.createElement("div");
    splash.id = "splash";
    splash.className = "splash";
    splash.setAttribute("role", "status");
    splash.setAttribute("aria-live", "polite");
    splash.innerHTML = `
      <div class="splash-inner">
        <div class="splash-thread" aria-hidden="true">
          <span class="splash-thread-bloom">🌸</span>
          <span class="splash-thread-line"></span>
        </div>
        <div class="couple-logo-wrap couple-logo-wrap--splash splash-logo-wrap" aria-hidden="true">
          <img class="couple-logo couple-logo--theme-light splash-logo" src="" alt="" decoding="async" />
          <img class="couple-logo couple-logo--theme-dark splash-logo" src="" alt="" decoding="async" />
        </div>
        <p class="splash-names"></p>
        <p class="splash-date"></p>
      </div>
    `;
    document.body.prepend(splash);

    const copy = splashCopy();
    splash.querySelector(".couple-logo--theme-light").src = copy.logo;
    splash.querySelector(".couple-logo--theme-dark").src = copy.logoDark;
    splash.querySelector(".splash-names").textContent = copy.names;
    splash.querySelector(".splash-date").textContent = copy.date;
  }

  function dismiss() {
    const splash = document.getElementById("splash");
    if (!splash) return;
    splash.classList.add("splash--out");
    document.body.classList.add("splash-done");
    const wait = reducedMotion ? 80 : FADE_MS;
    window.setTimeout(() => splash.remove(), wait);
  }

  function init() {
    build();
    if (!document.getElementById("splash")) return;

    window.addEventListener("load", () => {
      window.setTimeout(dismiss, reducedMotion ? 200 : SHOW_MS);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
