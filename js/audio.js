(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const audioCfg = cfg.audio || {};
  const pageLang =
    document.documentElement.getAttribute("data-invite-lang") || "";
  const isSpecial =
    document.documentElement.getAttribute("data-invite-type") === "special";
  const isLanding = document.body.classList.contains("landing-page");

  if (isLanding || isSpecial || (pageLang !== "en" && pageLang !== "ar")) {
    return;
  }

  const track = (audioCfg[pageLang] || "").trim();
  if (!track) return;

  const MUTE_KEY = "wedding-audio-muted";
  const root = ".";
  const src = `${root}/${track.replace(/^\.\//, "")}`;

  let audio = null;
  let unlocked = false;
  let muted = false;

  try {
    muted = localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }

  function uiCopy() {
    if (pageLang === "ar" && window.UI_COPY_AR) return window.UI_COPY_AR;
    return window.UI_COPY || {};
  }

  function ensureControls() {
    let bar = document.querySelector(".top-controls");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "top-controls";
      document.body.appendChild(bar);
      const themeBtn = document.getElementById("theme-toggle");
      if (themeBtn) bar.appendChild(themeBtn);
    }
    return bar;
  }

  function updateMuteButton() {
    const btn = document.getElementById("audio-toggle");
    if (!btn) return;
    const ui = uiCopy();
    btn.setAttribute("aria-pressed", muted ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      muted
        ? ui.audioUnmute || "Unmute music"
        : ui.audioMute || "Mute music"
    );
    btn.title = btn.getAttribute("aria-label");
    btn.textContent = muted ? "🔇" : "🔊";
  }

  function mountMuteButton() {
    if (document.getElementById("audio-toggle")) return;
    const bar = ensureControls();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "audio-toggle";
    btn.className = "audio-toggle";
    bar.appendChild(btn);
    updateMuteButton();
    btn.addEventListener("click", () => {
      setMuted(!muted);
      tryPlay();
    });
  }

  function setMuted(next) {
    muted = Boolean(next);
    if (audio) audio.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
    updateMuteButton();
  }

  function tryPlay() {
    if (!audio) return;
    audio.muted = muted;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          unlocked = true;
        })
        .catch(() => {
          /* autoplay blocked until gesture */
        });
    }
  }

  function unlockAndPlay() {
    if (unlocked) return;
    tryPlay();
  }

  function createAudio() {
    audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.muted = muted;
    audio.setAttribute("playsinline", "");
  }

  function init() {
    createAudio();
    mountMuteButton();
    tryPlay();

    const unlockEvents = ["pointerdown", "touchstart", "keydown", "scroll"];
    const onUnlock = () => {
      unlockAndPlay();
      if (unlocked) {
        unlockEvents.forEach((eventName) => {
          window.removeEventListener(eventName, onUnlock, true);
        });
      }
    };
    unlockEvents.forEach((eventName) => {
      window.addEventListener(eventName, onUnlock, {
        capture: true,
        passive: true,
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
