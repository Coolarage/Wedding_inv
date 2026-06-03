(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const ui = window.UI_COPY || {};
  const rsvpCfg = cfg.rsvp || {};
  const supabaseCfg = rsvpCfg.supabase || {};
  const RSVP_DONE_KEY = "wedding-rsvp-done";
  const RSVP_COMPLETE_DELAY_MS = 900;

  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("rsvp-status");
  if (!form) return;

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

  function finishRsvpFlow() {
    markRsvpComplete();
    setStatus(
      ui.rsvpSuccess || "Thank you! Your RSVP was received. 💕",
      "success"
    );

    window.setTimeout(() => {
      removeRsvpCard();
      goToActThree();
    }, RSVP_COMPLETE_DELAY_MS);
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
      plus_one: formData.get("plusOne") || "",
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
