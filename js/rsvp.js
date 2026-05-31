(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const ui = window.UI_COPY || {};
  const rsvpCfg = cfg.rsvp || {};

  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("rsvp-status");
  if (!form) return;

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const scriptUrl = (rsvpCfg.scriptUrl || "").trim();
    if (!scriptUrl) {
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

    const data = new FormData(form);
    data.append("page", pageSource());

    try {
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: data,
      });

      form.reset();
      setStatus(ui.rsvpSuccess || "Thank you! Your RSVP was received. 💕", "success");
    } catch (err) {
      setStatus(ui.rsvpError || "Something went wrong. Please try again.", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
