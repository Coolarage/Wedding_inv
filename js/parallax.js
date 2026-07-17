(function () {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reducedMotion) return;
  if (
    !document.querySelector(".scroll-act") &&
    !document.body.classList.contains("landing-page")
  ) {
    return;
  }

  /* Sparkles only — keep page background fixed so scrolling feels stable. */
  const sparkles = Array.from(document.querySelectorAll(".sparkles span"));
  if (!sparkles.length) return;

  let ticking = false;

  function apply() {
    const y = window.scrollY;
    sparkles.forEach((node, index) => {
      const rate = 0.008 + index * 0.003;
      node.style.transform = `translate3d(0, ${y * rate}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );

  apply();
})();
