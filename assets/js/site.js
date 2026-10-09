/* CIA : comportements du site. Aucun service tiers, aucun cookie, aucun stockage.
   - menu mobile accessible ;
   - en-tête qui se densifie au défilement ;
   - apparitions et compteurs au défilement (désactivés si l'utilisateur réduit les animations) ;
   - vidéo d'accueil chargée après la page, jamais en mode économie de données. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // menu
  var burger = d.querySelector(".burger"), nav = d.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var ouvert = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  // en-tête
  var head = d.querySelector(".site-head"), attente = false;
  function etat() { attente = false; if (head) head.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", function () {
    if (!attente) { attente = true; window.requestAnimationFrame(etat); }
  }, { passive: true });
  etat();

  // compteurs
  function compter(el) {
    var cible = parseInt(el.getAttribute("data-count"), 10);
    if (!cible || calme) return;
    var suffixe = el.textContent.replace(/^[0-9]+/, ""), t0 = null, duree = 1100;
    function pas(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / duree), v = Math.round(cible * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + suffixe;
      if (k < 1) window.requestAnimationFrame(pas);
    }
    window.requestAnimationFrame(pas);
  }

  // apparitions
  var cibles = d.querySelectorAll(".reveal, [data-count]");
  if ("IntersectionObserver" in window && !calme) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.classList.contains("reveal")) {
          el.style.transitionDelay = (i % 4) * 60 + "ms";
          el.classList.add("in");
        }
        if (el.hasAttribute("data-count")) compter(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    cibles.forEach(function (el) { io.observe(el); });
  } else {
    cibles.forEach(function (el) { el.classList.add("in"); });
  }

  // vidéo d'accueil
  var media = d.querySelector(".hero-media[data-video]");
  var co = navigator.connection || {};
  if (media && !calme && !co.saveData && !/(^|-)2g$/.test(co.effectiveType || "")) {
    window.addEventListener("load", function () {
      var base = media.getAttribute("data-video");
      var petit = window.matchMedia("(max-width: 760px)").matches;
      var v = d.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
      v.preload = "auto";
      [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (f) {
        var s = d.createElement("source");
        s.src = base + (petit ? "-720." : "-1280.") + f[0]; s.type = f[1]; v.appendChild(s);
      });
      v.addEventListener("playing", function () { v.classList.add("on"); }, { once: true });
      media.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  }
})();
