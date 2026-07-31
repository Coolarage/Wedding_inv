(function () {
  if (document.querySelector(".couple-flank")) return;
  if (!document.body) return;

  const isSpecial =
    document.documentElement.getAttribute("data-invite-type") === "special";
  const root = isSpecial ? ".." : ".";

  const flank = document.createElement("div");
  flank.className = "couple-flank";
  flank.setAttribute("aria-hidden", "true");
  flank.innerHTML = `
    <img class="couple-flank-img couple-flank-bride" src="${root}/assets/decor/bride.png" alt="" decoding="async" />
    <img class="couple-flank-img couple-flank-groom" src="${root}/assets/decor/groom.png" alt="" decoding="async" />
  `;
  document.body.appendChild(flank);
})();
