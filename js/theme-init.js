/** Apply saved theme before first paint — avoids logo/background flash. */
(function () {
  var theme = "light";
  try {
    var stored = localStorage.getItem("wedding-theme");
    if (stored === "dark" || stored === "light") theme = stored;
  } catch {
    /* storage unavailable */
  }
  document.documentElement.setAttribute("data-theme", theme);
})();
