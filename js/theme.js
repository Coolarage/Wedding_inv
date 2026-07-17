(function () {
  const STORAGE_KEY = "wedding-theme";
  const DEFAULT_THEME = "light";

  function storedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === "dark" || value === "light") return value;
      return DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }

  function themeArtPath(theme) {
    const cfg = window.WEDDING_CONFIG || {};
    const art = cfg.themeArt || {};
    const isSpecial =
      document.documentElement.getAttribute("data-invite-type") === "special";
    const root = isSpecial ? ".." : ".";
    const file = theme === "dark" ? art.dark : art.light;
    if (!file) return "";
    return `${root}/${file.replace(/^\.\//, "")}`;
  }

  function mountBgArt() {
    if (document.body.classList.contains("landing-page")) return;
    if (!document.querySelector(".page-bg") || document.querySelector(".page-bg-art")) {
      return;
    }

    const art = document.createElement("div");
    art.className = "page-bg-art";
    art.setAttribute("aria-hidden", "true");
    document.querySelector(".page-bg").after(art);
    updateBgArt(document.documentElement.getAttribute("data-theme") || DEFAULT_THEME);
  }

  function updateBgArt(theme) {
    const art = document.querySelector(".page-bg-art");
    if (!art) return;
    const path = themeArtPath(theme);
    art.style.backgroundImage = path ? `url("${path}")` : "none";
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = next === "light" ? "#fff0f6" : "#c2185b";
    }

    updateBgArt(next);
    updateToggle(next);
  }

  function uiCopy() {
    const pageLang =
      document.documentElement.getAttribute("data-invite-lang") || "en";
    const isSpecial =
      document.documentElement.getAttribute("data-invite-type") === "special";
    if (pageLang === "ar" && !isSpecial && window.UI_COPY_AR) {
      return window.UI_COPY_AR;
    }
    return window.UI_COPY || {};
  }

  function updateToggle(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    const ui = uiCopy();
    const isLight = theme === "light";

    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      isLight
        ? ui.themeDark || "Switch to dark mode"
        : ui.themeLight || "Switch to light mode"
    );
    btn.title = btn.getAttribute("aria-label");
    btn.textContent = isLight ? "🌙" : "☀️";
  }

  function mountToggle() {
    if (!document.body || document.getElementById("theme-toggle")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "theme-toggle";
    btn.className = "theme-toggle";
    document.body.appendChild(btn);
    updateToggle(
      document.documentElement.getAttribute("data-theme") || DEFAULT_THEME
    );
    btn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark";
      applyTheme(current === "light" ? "dark" : "light");
    });
  }

  window.WeddingTheme = {
    refresh() {
      updateToggle(
        document.documentElement.getAttribute("data-theme") || DEFAULT_THEME
      );
    },
  };

  applyTheme(storedTheme());

  function init() {
    mountBgArt();
    mountToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
