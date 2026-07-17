(function () {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const SPLASH_KEY = "wedding-splash-shown";
  const SHOW_MS = 3200;
  const FADE_MS = 900;

  function shouldRun() {
    if (!document.querySelector(".scroll-act")) return false;
    try {
      return sessionStorage.getItem(SPLASH_KEY) !== "1";
    } catch {
      return true;
    }
  }

  function markShown() {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  }

  function splashCopy() {
    const cfg = window.WEDDING_CONFIG || {};
    const pageLang =
      document.documentElement.getAttribute("data-invite-lang") || "en";
    const isSpecial =
      document.documentElement.getAttribute("data-invite-type") === "special";

    if (pageLang === "en" || isSpecial) {
      return {
        names: `${cfg.groomEn || "Mohab"} & ${cfg.brideEn || "Hams"}`,
        date: cfg.eventEn?.dateLine || "Wednesday · 30 September 2026",
      };
    }

    const join = " و ";
    return {
      names: `${cfg.groom || "مهاب"}${join}${cfg.bride || "همس"}`,
      date: cfg.eventAr?.dateLine || "الأربعاء · ٣٠ سبتمبر ٢٠٢٦",
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
        <p class="splash-names"></p>
        <p class="splash-date"></p>
      </div>
    `;
    document.body.prepend(splash);

    const copy = splashCopy();
    splash.querySelector(".splash-names").textContent = copy.names;
    splash.querySelector(".splash-date").textContent = copy.date;
    markShown();
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
