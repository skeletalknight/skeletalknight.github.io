(function () {
  var root = document.documentElement;

  // Theme toggle: an explicit choice is saved; otherwise follow the system.
  var toggle = document.getElementById("theme-toggle");
  toggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // Older news collapse.
  var list = document.getElementById("news-list");
  var newsBtn = document.getElementById("news-toggle");
  newsBtn.addEventListener("click", function () {
    var open = list.classList.toggle("expanded");
    newsBtn.setAttribute("aria-expanded", String(open));
    newsBtn.textContent = open ? "Show less" : "Show older news";
  });

  // Top bar border + brand once the hero scrolls away.
  var bar = document.querySelector(".topbar");
  var onScroll = function () { bar.classList.toggle("scrolled", window.scrollY > 120); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight the nav link of the section in view.
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    // Gentle fade-in for sections below the fold.
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          reveal.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".section").forEach(function (el) {
      el.classList.add("reveal");
      reveal.observe(el);
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
