(function () {
  function start() {
    const cfg = window.WEDDING_CONFIG || {};
    const audioCfg = cfg.audio || {};
    const pageLang =
      document.documentElement.getAttribute("data-invite-lang") || "";
    const isSpecial =
      document.documentElement.getAttribute("data-invite-type") === "special";
    const isLanding =
      document.body && document.body.classList.contains("landing-page");

    if (isLanding || isSpecial || (pageLang !== "en" && pageLang !== "ar")) {
      return;
    }

    const track = (audioCfg[pageLang] || "").trim();
    if (!track) return;

    const MUTE_KEY = "wedding-audio-muted";
    const src = track.replace(/^\.\//, "");
    const absoluteSrc = new URL(src, window.location.href).href;

    let audio = null;
    let playing = false;
    let userMuted = false;
    let unlockBound = false;
    const unlockEvents = [
      "pointerdown",
      "touchstart",
      "touchend",
      "click",
      "keydown",
      "scroll",
      "wheel",
    ];
    let unlockHandlers = [];

    try {
      userMuted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      userMuted = false;
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
      }
      const themeBtn = document.getElementById("theme-toggle");
      if (themeBtn && themeBtn.parentElement !== bar) {
        bar.appendChild(themeBtn);
      }
      return bar;
    }

    function updateMuteButton() {
      const btn = document.getElementById("audio-toggle");
      if (!btn) return;
      const ui = uiCopy();
      btn.setAttribute("aria-pressed", userMuted ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        userMuted
          ? ui.audioUnmute || "Unmute music"
          : ui.audioMute || "Mute music"
      );
      btn.title = btn.getAttribute("aria-label");
      btn.textContent = userMuted ? "🔇" : "🔊";
      btn.classList.toggle("is-waiting", !playing && !userMuted);
    }

    function mountMuteButton() {
      if (document.getElementById("audio-toggle")) {
        updateMuteButton();
        return;
      }
      const bar = ensureControls();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "audio-toggle";
      btn.className = "audio-toggle";
      bar.appendChild(btn);
      updateMuteButton();
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!playing && !userMuted) {
          playWithSound(true);
          return;
        }
        userMuted = !userMuted;
        persistMute(userMuted);
        if (audio) audio.muted = userMuted;
        if (!userMuted) playWithSound(true);
        else updateMuteButton();
      });
    }

    function persistMute(next) {
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
    }

    function syncMuteState() {
      if (!audio) return;
      audio.muted = userMuted;
    }

    function playWithSound(fromGesture) {
      if (!audio || userMuted) return Promise.resolve(false);
      syncMuteState();

      return audio
        .play()
        .then(() => {
          playing = true;
          updateMuteButton();
          if (fromGesture) removeUnlockListeners();
          return true;
        })
        .catch(() => {
          playing = false;
          updateMuteButton();
          if (!fromGesture) bindUnlock();
          return false;
        });
    }

    function unlockFromGesture() {
      if (userMuted || playing) return;
      playWithSound(true);
    }

    function removeUnlockListeners() {
      unlockHandlers.forEach(({ name, fn, target }) => {
        target.removeEventListener(name, fn, true);
      });
      unlockHandlers = [];
      unlockBound = false;
    }

    function bindUnlock() {
      if (unlockBound || playing || userMuted) return;
      unlockBound = true;

      const onUnlock = () => unlockFromGesture();
      unlockEvents.forEach((name) => {
        const target = name === "scroll" || name === "wheel" ? window : document;
        target.addEventListener(name, onUnlock, {
          capture: true,
          passive: true,
        });
        unlockHandlers.push({ name, fn: onUnlock, target });
      });
    }

    function preloadTrack() {
      if (document.querySelector('link[data-audio-preload="1"]')) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "audio";
      link.href = absoluteSrc;
      link.setAttribute("data-audio-preload", "1");
      document.head.appendChild(link);
    }

    function createAudio() {
      audio = document.createElement("audio");
      audio.id = "invite-audio";
      audio.src = absoluteSrc;
      audio.loop = true;
      audio.preload = "auto";
      audio.autoplay = true;
      audio.playsInline = true;
      audio.setAttribute("playsinline", "");
      audio.setAttribute("webkit-playsinline", "");
      syncMuteState();
      audio.style.display = "none";
      document.body.appendChild(audio);

      audio.addEventListener("playing", () => {
        playing = true;
        updateMuteButton();
      });
      audio.addEventListener("pause", () => {
        if (audio.ended) return;
        playing = false;
        updateMuteButton();
      });
      audio.addEventListener("canplaythrough", () => {
        if (!playing && !userMuted) playWithSound(false);
      });
      audio.addEventListener("error", () => {
        playing = false;
        updateMuteButton();
        console.warn("Wedding audio failed to load:", absoluteSrc, audio.error);
      });
    }

    preloadTrack();
    createAudio();
    mountMuteButton();
    playWithSound(false);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden || userMuted || playing) return;
      playWithSound(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
