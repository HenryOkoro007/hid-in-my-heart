/* "You're leaving the app" notice for every link marked data-leave="Site name".
   Those links also carry rel="noopener noreferrer", so the other site is not told which page you came from. */
(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-leave]");
    if (!a) return;
    var site = a.getAttribute("data-leave") || "another website";
    var msg = "You're leaving Hid in my heart for " + site + ".\n\n" +
      site + " has its own privacy policy and may record your visit. Only the address of the page you open is sent; none of your progress goes with you.\n\nContinue?";
    if (!window.confirm(msg)) e.preventDefault();
  });
})();
