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
    let muted = false;
    let unlockBound = false;

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
      btn.setAttribute("aria-pressed", muted ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        muted
          ? ui.audioUnmute || "Unmute music"
          : ui.audioMute || "Mute music"
      );
      btn.title = btn.getAttribute("aria-label");
      btn.textContent = muted ? "🔇" : "🔊";
      btn.classList.toggle("is-waiting", !playing && !muted);
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
      btn.addEventListener("click", () => {
        // First tap always tries to start audio (browser autoplay unlock).
        if (!playing) {
          setMuted(false);
          playNow(true);
          return;
        }
        setMuted(!muted);
        if (!muted) playNow(true);
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

    function playNow(forceUnmuteGesture) {
      if (!audio) return Promise.resolve(false);
      if (forceUnmuteGesture) audio.muted = muted;
      else audio.muted = muted;

      return audio
        .play()
        .then(() => {
          playing = true;
          updateMuteButton();
          return true;
        })
        .catch(() => {
          playing = false;
          updateMuteButton();
          return false;
        });
    }

    function bindUnlock() {
      if (unlockBound) return;
      unlockBound = true;
      const events = ["pointerdown", "touchstart", "click", "keydown"];
      const onUnlock = () => {
        playNow(true).then((ok) => {
          if (ok) {
            events.forEach((name) =>
              document.removeEventListener(name, onUnlock, true)
            );
          }
        });
      };
      events.forEach((name) => {
        document.addEventListener(name, onUnlock, true);
      });
    }

    function createAudio() {
      audio = document.createElement("audio");
      audio.id = "invite-audio";
      audio.src = absoluteSrc;
      audio.loop = true;
      audio.preload = "auto";
      audio.playsInline = true;
      audio.setAttribute("playsinline", "");
      audio.setAttribute("webkit-playsinline", "");
      audio.muted = muted;
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
      audio.addEventListener("error", () => {
        playing = false;
        updateMuteButton();
        console.warn("Wedding audio failed to load:", absoluteSrc, audio.error);
      });
    }

    createAudio();
    mountMuteButton();

    // Try unmuted autoplay; if blocked, keep waiting for a tap.
    playNow(false).then((ok) => {
      if (!ok) bindUnlock();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
