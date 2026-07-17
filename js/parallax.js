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

  const pageBg = document.querySelector(".page-bg");
  const pageBgArt = document.querySelector(".page-bg-art");
  const sparkles = Array.from(document.querySelectorAll(".sparkles span"));
  if (!pageBg && !pageBgArt && !sparkles.length) return;

  let ticking = false;

  function apply() {
    const y = window.scrollY;
    if (pageBg) {
      pageBg.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
    }
    if (pageBgArt) {
      pageBgArt.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
    }
    sparkles.forEach((node, index) => {
      const rate = 0.018 + index * 0.008;
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
