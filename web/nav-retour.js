/* =====================================================================
   INO-Education — Flèche RETOUR unique et globale.
   Une seule flèche en haut à gauche ramène au niveau immédiatement
   précédent. Elle remplace toutes les anciennes flèches (masquées).
   ===================================================================== */
(function () {
  "use strict";

  function estVisible(el) { return el && !el.disabled && el.offsetParent !== null; }

  function retourGlobal() {
    // 1) Module Lecture actif : il gère lui-même étape -> menu -> matières
    if (window.lectureEstActif && window.lectureEstActif()) {
      if (window.lectureRetour) { window.lectureRetour(); return; }
    }
    // 2) Sinon : la dernière flèche visible = le niveau immédiatement précédent
    var boutons = Array.prototype.slice.call(document.querySelectorAll(".bouton-etape-nav")).filter(estVisible);
    if (boutons.length) boutons[boutons.length - 1].click();
  }

  function backDisponible() {
    if (window.lectureEstActif && window.lectureEstActif()) return true;
    return Array.prototype.slice.call(document.querySelectorAll(".bouton-etape-nav")).some(estVisible);
  }

  var fleche;
  function majFleche() { if (fleche) fleche.style.display = backDisponible() ? "flex" : "none"; }

  function init() {
    var st = document.createElement("style");
    st.textContent =
      "#retour-global{position:fixed;top:14px;left:14px;z-index:9999;width:44px;height:44px;border-radius:50%;border:1px solid rgba(232,183,92,.5);background:rgba(22,36,29,.92);color:#e8b75c;font-size:24px;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.35);}" +
      "#retour-global:hover{background:#e8b75c;color:#16241d;}" +
      ".bouton-etape-nav{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;opacity:0!important;pointer-events:none!important;}" +
      ".lec-retour{display:none!important;}";
    document.head.appendChild(st);

    fleche = document.createElement("button");
    fleche.id = "retour-global";
    fleche.type = "button";
    fleche.setAttribute("aria-label", "Retour");
    fleche.textContent = "←";
    fleche.addEventListener("click", retourGlobal);
    document.body.appendChild(fleche);

    document.addEventListener("click", function () { setTimeout(majFleche, 0); }, true);
    try {
      var mo = new MutationObserver(function () { window.requestAnimationFrame(majFleche); });
      mo.observe(document.body, { attributes: true, attributeFilter: ["hidden", "style", "class"], subtree: true });
    } catch (e) {}
    majFleche();
    setInterval(majFleche, 800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
