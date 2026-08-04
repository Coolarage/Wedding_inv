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
    let awaitingUnmute = false;
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
      const showMuted = userMuted || awaitingUnmute;
      btn.setAttribute("aria-pressed", showMuted ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        userMuted
          ? ui.audioUnmute || "Unmute music"
          : awaitingUnmute
            ? ui.audioUnmute || "Tap to hear music"
            : ui.audioMute || "Mute music"
      );
      btn.title = btn.getAttribute("aria-label");
      btn.textContent = userMuted || awaitingUnmute ? "🔇" : "🔊";
      btn.classList.toggle("is-waiting", awaitingUnmute || (!playing && !userMuted));
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
        if (awaitingUnmute || !playing) {
          userMuted = false;
          awaitingUnmute = false;
          persistMute(false);
          unmuteAndPlay();
          return;
        }
        userMuted = !userMuted;
        persistMute(userMuted);
        if (audio) audio.muted = userMuted;
        if (!userMuted) unmuteAndPlay();
        updateMuteButton();
      });
    }

    function persistMute(next) {
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
    }

    function unmuteAndPlay() {
      if (!audio) return Promise.resolve(false);
      awaitingUnmute = false;
      if (!userMuted) audio.muted = false;

      return audio
        .play()
        .then(() => {
          playing = true;
          updateMuteButton();
          return true;
        })
        .catch(() => {
          playing = audio && !audio.paused;
          updateMuteButton();
          return false;
        });
    }

    function tryMutedAutoplay() {
      if (!audio || userMuted) return Promise.resolve(false);
      audio.muted = true;
      return audio
        .play()
        .then(() => {
          playing = true;
          awaitingUnmute = true;
          updateMuteButton();
          bindUnlock();
          return true;
        })
        .catch(() => {
          playing = false;
          awaitingUnmute = false;
          updateMuteButton();
          return false;
        });
    }

    function attemptAutoplay() {
      if (!audio) return Promise.resolve(false);
      if (userMuted) {
        audio.muted = true;
        return audio.play().then(() => {
          playing = true;
          updateMuteButton();
          return true;
        }).catch(() => false);
      }

      audio.muted = false;
      return audio
        .play()
        .then(() => {
          playing = true;
          awaitingUnmute = false;
          updateMuteButton();
          return true;
        })
        .catch(() => tryMutedAutoplay().then((ok) => {
          if (!ok) bindUnlock();
          return ok;
        }));
    }

    function unlockFromGesture() {
      if (userMuted) return;
      if (awaitingUnmute || !playing) {
        unmuteAndPlay().then((ok) => {
          if (ok) removeUnlockListeners();
        });
        return;
      }
      if (!playing) {
        attemptAutoplay().then((ok) => {
          if (ok && !awaitingUnmute) removeUnlockListeners();
        });
      }
    }

    function removeUnlockListeners() {
      unlockHandlers.forEach(({ name, fn, target }) => {
        target.removeEventListener(name, fn, true);
      });
      unlockHandlers = [];
      unlockBound = false;
    }

    function bindUnlock() {
      if (unlockBound) return;
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
      audio.muted = userMuted;
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
        if (!playing && !userMuted) attemptAutoplay();
      });
      audio.addEventListener("error", () => {
        playing = false;
        awaitingUnmute = false;
        updateMuteButton();
        console.warn("Wedding audio failed to load:", absoluteSrc, audio.error);
      });
    }

    preloadTrack();
    createAudio();
    mountMuteButton();

    attemptAutoplay();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden || userMuted) return;
      if (!playing || awaitingUnmute) {
        attemptAutoplay();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
