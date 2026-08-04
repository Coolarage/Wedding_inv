/** Prime audio during the language-picker tap so the invite can play with sound. */
(function () {
  function prime(lang, url) {
    const cfg = window.WEDDING_CONFIG || {};
    const track = ((cfg.audio || {})[lang] || "").trim();
    if (!track) return;

    const audio = new Audio(track.replace(/^\.\//, ""));
    audio.loop = true;
    audio.preload = "auto";
    audio.playsInline = true;
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");

    try {
      sessionStorage.setItem("wedding-audio-primed", lang);
    } catch {
      /* storage unavailable */
    }

    audio.play().catch(() => {
      /* invite page will retry on first gesture */
    });

    window.setTimeout(() => {
      window.location.href = url;
    }, 0);
  }

  function init() {
    if (!document.body.classList.contains("landing-page")) return;

    document.querySelectorAll(".landing-btn").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = link.getAttribute("href");
        if (!url) return;
        const lang = url.includes("ar.html") ? "ar" : "en";
        prime(lang, url);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
