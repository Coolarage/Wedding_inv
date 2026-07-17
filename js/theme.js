(function () {
  const STORAGE_KEY = "wedding-theme";

  function storedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  }

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
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

    updateToggle(next);
  }

  function updateToggle(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    const ui = window.UI_COPY || {};
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
    updateToggle(document.documentElement.getAttribute("data-theme") || "dark");
    btn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark";
      applyTheme(current === "light" ? "dark" : "light");
    });
  }

  applyTheme(storedTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }
})();
