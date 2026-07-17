(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const ui = window.UI_COPY || {};
  const rsvpCfg = cfg.rsvp || {};
  const supabaseCfg = rsvpCfg.supabase || {};
  const RSVP_DONE_KEY = "wedding-rsvp-done";
  const RSVP_BURST_MS = 700;
  const RSVP_GOTO_ACT_MS = 1300;

  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("rsvp-status");
  if (!form) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function rsvpStorageKey() {
    return `${RSVP_DONE_KEY}:${pageSource()}`;
  }

  function isRsvpComplete() {
    try {
      return localStorage.getItem(rsvpStorageKey()) === "1";
    } catch {
      return false;
    }
  }

  function markRsvpComplete() {
    try {
      localStorage.setItem(rsvpStorageKey(), "1");
    } catch {
      /* storage unavailable */
    }
  }

  function removeRsvpCard() {
    const section = document.getElementById("rsvp-section");
    if (section) section.remove();
    document.body.classList.add("rsvp-completed");
    window.WeddingScrollActs?.refresh?.();
  }

  function goToActThree() {
    const scrollActs = window.WeddingScrollActs;
    if (scrollActs?.goToAct) {
      scrollActs.goToAct(2);
      return;
    }
    document.getElementById("act-3")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function launchRsvpBurst(container) {
    if (!container || reducedMotion) return;

    const layer = document.createElement("div");
    layer.className = "rsvp-burst";
    layer.setAttribute("aria-hidden", "true");
    const emojis = ["💕", "💖", "💗", "✨", "🌸", "💍"];

    for (let i = 0; i < 24; i++) {
      const particle = document.createElement("span");
      particle.className = "rsvp-burst-particle";
      particle.textContent = emojis[i % emojis.length];
      particle.style.setProperty("--bx", `${random(-120, 120)}px`);
      particle.style.setProperty("--by", `${random(-140, -40)}px`);
      particle.style.setProperty("--rot", `${random(-160, 160)}deg`);
      particle.style.setProperty("--delay", `${random(0, 280)}ms`);
      particle.style.left = `${random(12, 88)}%`;
      particle.style.top = `${random(35, 75)}%`;
      layer.appendChild(particle);
    }

    container.appendChild(layer);
    window.setTimeout(() => layer.remove(), 1800);
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function finishRsvpFlow() {
    markRsvpComplete();
    setStatus(
      ui.rsvpSuccess || "Thank you! Your RSVP was received. 💕",
      "success"
    );

    const section = document.getElementById("rsvp-section");
    if (section) {
      section.classList.add("rsvp-card--success");
      launchRsvpBurst(section);
      window.setTimeout(() => {
        section.classList.add("rsvp-card--leaving");
      }, RSVP_BURST_MS);
    }

    window.setTimeout(() => {
      removeRsvpCard();
      goToActThree();
    }, reducedMotion ? 400 : RSVP_GOTO_ACT_MS);
  }

  if (isRsvpComplete()) {
    removeRsvpCard();
    return;
  }

  const guestName = document.documentElement.getAttribute("data-guest-name");
  const nameInput = document.getElementById("rsvp-name");
  if (
    nameInput &&
    guestName &&
    !guestName.toLowerCase().includes("guest") &&
    !nameInput.value
  ) {
    nameInput.value = guestName.replace(/^dear\s+/i, "").trim();
  }

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.className = "rsvp-status rsvp-status--" + (type || "info");
  }

  function pageSource() {
    const path = window.location.pathname || "";
    return path.split("/").pop() || "index.html";
  }

  function formPayload(formData) {
    return {
      name: (formData.get("name") || "").trim(),
      attending: formData.get("attending") || "",
      message: (formData.get("message") || "").trim(),
      page: pageSource(),
    };
  }

  function supabaseReady() {
    return Boolean(
      (supabaseCfg.url || "").trim() && (supabaseCfg.anonKey || "").trim()
    );
  }

  function scriptReady() {
    return Boolean((rsvpCfg.scriptUrl || "").trim());
  }

  async function submitToSupabase(payload) {
    const baseUrl = supabaseCfg.url.trim().replace(/\/$/, "");
    const table = (supabaseCfg.table || "rsvps").trim();
    const anonKey = supabaseCfg.anonKey.trim();

    const res = await fetch(`${baseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Supabase error (${res.status})`);
    }
  }

  async function submitToAppsScript(formData) {
    formData.append("page", pageSource());
    await fetch(rsvpCfg.scriptUrl.trim(), {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isRsvpComplete()) return;

    const useSupabase = supabaseReady();
    const useScript = scriptReady();

    if (!useSupabase && !useScript) {
      setStatus(
        ui.rsvpNotConfigured ||
          "RSVP is not connected yet. Please contact the couple directly.",
        "error"
      );
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus(ui.rsvpSending || "Sending…", "info");

    const formData = new FormData(form);
    let succeeded = false;

    try {
      if (useSupabase) {
        await submitToSupabase(formPayload(formData));
      } else {
        await submitToAppsScript(formData);
      }

      succeeded = true;
      form.reset();
      finishRsvpFlow();
    } catch (err) {
      setStatus(ui.rsvpError || "Something went wrong. Please try again.", "error");
    } finally {
      if (!succeeded && submitBtn) submitBtn.disabled = false;
    }
  });
})();
