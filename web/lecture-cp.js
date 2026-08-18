/* =====================================================================
   INO-Education — Module LECTURE pour CP1 / CP2
   Parcours : Lettres -> Sons -> Syllabes -> Prononcer -> Mots ->
              Phrases -> Comprendre. Audio (synthèse vocale FR),
              suivi de progression (local), bouton "Continuer".
   Contenu stable, adapté au Burkina Faso. Chargé avant script.js.
   ===================================================================== */
(function () {
  "use strict";

  // ---------- Données pédagogiques (stables) ----------
  const LETTRES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const CONSONNES = ["M", "P", "L", "S", "R", "T", "B", "D", "N", "V", "F"];
  const VOYELLES = ["A", "E", "I", "O", "U"];
  const SYLLABES = [];
  CONSONNES.forEach((c) => VOYELLES.forEach((v) => SYLLABES.push(c + v)));

  const MOTS = [
    { mot: "PAPA", emoji: "👨", syllabes: ["PA", "PA"] },
    { mot: "MAMAN", emoji: "👩", syllabes: ["MA", "MAN"] },
    { mot: "MOTO", emoji: "🏍️", syllabes: ["MO", "TO"] },
    { mot: "VELO", emoji: "🚲", syllabes: ["VE", "LO"] },
    { mot: "ECOLE", emoji: "🏫", syllabes: ["E", "CO", "LE"] },
    { mot: "MAISON", emoji: "🏠", syllabes: ["MAI", "SON"] },
    { mot: "BANANE", emoji: "🍌", syllabes: ["BA", "NA", "NE"] },
    { mot: "TOMATE", emoji: "🍅", syllabes: ["TO", "MA", "TE"] },
    { mot: "MANGUE", emoji: "🥭", syllabes: ["MAN", "GUE"] },
    { mot: "LAPIN", emoji: "🐇", syllabes: ["LA", "PIN"] },
  ];

  const PHRASES = [
    { texte: "Maman a une mangue.", question: "Qui a une mangue ?", options: ["Maman", "Papa", "Ali"], bonne: 0 },
    { texte: "Awa va à l'école.", question: "Où va Awa ?", options: ["À l'école", "À la maison", "Au marché"], bonne: 0 },
    { texte: "Le chat boit du lait.", question: "Que boit le chat ?", options: ["Du lait", "De l'eau", "Du jus"], bonne: 0 },
    { texte: "Papa achète du riz au marché.", question: "Où va papa ?", options: ["Au marché", "À l'école", "À la maison"], bonne: 0 },
  ];

  const TEXTES = [
    {
      texte: "Awa va à l'école. Elle porte son sac. Dans son sac, il y a un livre.",
      questions: [
        { q: "Où va Awa ?", options: ["À l'école", "Au champ", "Au marché"], bonne: 0 },
        { q: "Que porte Awa ?", options: ["Son sac", "Un seau", "Un ballon"], bonne: 0 },
        { q: "Qu'y a-t-il dans le sac ?", options: ["Un livre", "Une mangue", "Un stylo"], bonne: 0 },
      ],
    },
    {
      texte: "Moussa a une chèvre. La chèvre mange de l'herbe. Moussa aime sa chèvre.",
      questions: [
        { q: "Qui a une chèvre ?", options: ["Moussa", "Awa", "Ali"], bonne: 0 },
        { q: "Que mange la chèvre ?", options: ["De l'herbe", "Du riz", "Une mangue"], bonne: 0 },
      ],
    },
  ];

  const ETAPES = [
    { id: "lettres", num: 1, icone: "🔤", titre: "Les lettres", desc: "Reconnaître et prononcer" },
    { id: "sons", num: 2, icone: "👂", titre: "Les sons", desc: "Écouter et reconnaître" },
    { id: "syllabes", num: 3, icone: "🧩", titre: "Les syllabes", desc: "MA – ME – MI – MO – MU" },
    { id: "prononcer", num: 4, icone: "🗣️", titre: "Prononcer", desc: "Écouter et répéter" },
    { id: "mots", num: 5, icone: "📝", titre: "Les mots", desc: "Lire et construire" },
    { id: "phrases", num: 6, icone: "📚", titre: "Les phrases", desc: "Lire et comprendre" },
    { id: "comprendre", num: 7, icone: "🧠", titre: "Comprendre", desc: "Petites histoires" },
  ];

  // ---------- État / progression ----------
  let classeActuelle = "CP1";
  let conteneur = null;

  function cleProg() { return "ino_lecture_prog_" + classeActuelle; }
  function lireProg() { try { return JSON.parse(localStorage.getItem(cleProg())) || {}; } catch (e) { return {}; } }
  function ecrireProg(p) { try { localStorage.setItem(cleProg(), JSON.stringify(p)); } catch (e) {} }
  function setProg(id, pct) { const p = lireProg(); p[id] = Math.max(p[id] || 0, Math.round(pct)); ecrireProg(p); }
  function etapeCourante() { const p = lireProg(); for (const e of ETAPES) { if ((p[e.id] || 0) < 100) return e; } return ETAPES[0]; }

  // ---------- Audio ----------
  function parler(texte) {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texte);
      u.lang = "fr-FR"; u.rate = 0.85;
      const vf = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("fr"));
      if (vf) u.voice = vf;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---------- Utilitaires ----------
  function melanger(a) { return a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((z) => z[1]); }
  function echantillon(a, n) { return melanger(a.slice()).slice(0, n); }

  // ---------- Rendu : accueil ----------
  function rendreAccueil() {
    const p = lireProg();
    const cont = etapeCourante();
    conteneur.innerHTML =
      '<div class="lec-entete"><div class="lec-prof">👩🏾‍🏫</div><div>' +
      '<div class="lec-bonjour">Bonjour ! Que veux-tu apprendre ?</div>' +
      '<div class="lec-classe">Lecture — ' + classeActuelle + '</div></div></div>' +
      '<button class="lec-continuer" id="lec-continuer">▶️ Continuer — ' + cont.icone + ' ' + cont.titre + '</button>' +
      '<div class="lec-etapes">' +
      ETAPES.map((e) =>
        '<button class="lec-etape" data-etape="' + e.id + '">' +
        '<span class="lec-etape-ico">' + e.icone + '</span>' +
        '<span class="lec-etape-txt"><b>' + e.num + '. ' + e.titre + '</b><small>' + e.desc + '</small></span>' +
        '<span class="lec-barre"><span class="lec-barre-in" style="width:' + (p[e.id] || 0) + '%"></span></span>' +
        '</button>'
      ).join("") + '</div>' +
      '<div class="lec-progression-titre">⭐ Ma progression</div>' +
      '<div class="lec-progression">' +
      ETAPES.map((e) =>
        '<div class="lec-prog-ligne"><span>' + e.icone + ' ' + e.titre + '</span>' +
        '<span class="lec-barre"><span class="lec-barre-in" style="width:' + (p[e.id] || 0) + '%"></span></span>' +
        '<span class="lec-pct">' + (p[e.id] || 0) + '%</span></div>'
      ).join("") + '</div>';
    conteneur.querySelector("#lec-continuer").addEventListener("click", () => rendreEtape(etapeCourante().id));
    conteneur.querySelectorAll(".lec-etape").forEach((b) => b.addEventListener("click", () => rendreEtape(b.dataset.etape)));
  }

  // ---------- Cadre d'une étape ----------
  function cadre(etape, html) {
    conteneur.innerHTML =
      '<button class="lec-retour" id="lec-retour">← Retour</button>' +
      '<h3 class="lec-titre-etape">' + etape.icone + ' ' + etape.titre + '</h3>' +
      '<div class="lec-zone">' + html + '</div>' +
      '<div class="lec-feedback" id="lec-feedback" hidden></div>';
    conteneur.querySelector("#lec-retour").addEventListener("click", rendreAccueil);
  }
  function feedback(ok, msg) {
    const f = conteneur.querySelector("#lec-feedback");
    if (!f) return;
    f.hidden = false;
    f.className = "lec-feedback " + (ok ? "ok" : "ko");
    f.textContent = msg;
  }
  function cadreFin(etape) {
    conteneur.innerHTML =
      '<div class="lec-fin"><div class="lec-fin-emoji">🏆</div>' +
      '<h3>Bravo ! Étape « ' + etape.titre + ' » réussie.</h3>' +
      '<button class="lec-bouton-suite" id="lec-fin-retour">← Retour au menu</button></div>';
    conteneur.querySelector("#lec-fin-retour").addEventListener("click", rendreAccueil);
    parler("Bravo !");
  }

  // ---------- Moteur générique : série de questions à choix ----------
  function lancerSerie(etape, items) {
    let i = 0;
    function afficher() {
      if (i >= items.length) { setProg(etape.id, 100); cadreFin(etape); return; }
      const it = items[i];
      const petits = it.options.every((o) => String(o.label).length <= 2);
      cadre(etape,
        (it.texteHaut ? '<div class="lec-texte">' + it.texteHaut + '</div>' : "") +
        (it.audioTexte ? '<button class="lec-ecouter" id="lec-ecouter">🔊 Écouter</button>' : "") +
        '<div class="lec-consigne">' + it.consigne + '</div>' +
        '<div class="lec-options">' +
        it.options.map((o, idx) => '<button class="lec-opt ' + (petits ? "" : "lec-opt-texte") + '" data-i="' + idx + '">' + o.label + '</button>').join("") +
        '</div><div class="lec-avance">' + (i + 1) + ' / ' + items.length + '</div>'
      );
      if (it.audioTexte) {
        conteneur.querySelector("#lec-ecouter").addEventListener("click", () => parler(it.audioTexte));
        if (it.autoAudio) setTimeout(() => parler(it.audioTexte), 300);
      }
      setProg(etape.id, (i / items.length) * 100);
      conteneur.querySelectorAll(".lec-opt").forEach((b) => b.addEventListener("click", () => {
        if (b.disabled) return;
        if (it.options[+b.dataset.i].correct) {
          b.classList.add("bon");
          conteneur.querySelectorAll(".lec-opt").forEach((x) => (x.disabled = true));
          feedback(true, "⭐ Bravo !"); parler("Bravo");
          setTimeout(() => { i++; afficher(); }, 900);
        } else {
          b.classList.add("mauvais"); b.disabled = true;
          feedback(false, "😊 Essaie encore. Écoute bien.");
        }
      }));
    }
    afficher();
  }

  // ---------- Étapes ----------
  function etapeLettres() {
    const cibles = echantillon(LETTRES, 8);
    lancerSerie(ETAPES[0], cibles.map((L) => {
      const autres = echantillon(LETTRES.filter((x) => x !== L), 3).map((a) => ({ label: a, correct: false }));
      return { consigne: "Où est la lettre " + L + " ?", audioTexte: "Où est la lettre " + L, autoAudio: true, options: melanger([{ label: L, correct: true }].concat(autres)) };
    }));
  }
  function etapeSons() {
    const cibles = echantillon(SYLLABES, 8);
    lancerSerie(ETAPES[1], cibles.map((S) => {
      const autres = echantillon(SYLLABES.filter((x) => x !== S), 2).map((a) => ({ label: a, correct: false }));
      return { consigne: "Quel son as-tu entendu ?", audioTexte: S, autoAudio: true, options: melanger([{ label: S, correct: true }].concat(autres)) };
    }));
  }
  function etapeSyllabes() {
    const cibles = echantillon(SYLLABES, 8);
    lancerSerie(ETAPES[2], cibles.map((S) => {
      const autres = echantillon(SYLLABES.filter((x) => x !== S), 2).map((a) => ({ label: a, correct: false }));
      return { consigne: "Assemble : " + S[0] + " + " + S[1] + " = ?", audioTexte: S[0] + " ... " + S[1] + " ... " + S, options: melanger([{ label: S, correct: true }].concat(autres)) };
    }));
  }
  function etapePhrases() {
    lancerSerie(ETAPES[5], echantillon(PHRASES, 4).map((p) => ({
      texteHaut: p.texte, audioTexte: p.texte, consigne: p.question,
      options: p.options.map((o, idx) => ({ label: o, correct: idx === p.bonne })),
    })));
  }
  function etapePrononcer() {
    const mots = echantillon(MOTS, 6);
    let i = 0;
    function afficher() {
      if (i >= mots.length) { setProg("prononcer", 100); cadreFin(ETAPES[3]); return; }
      const m = mots[i];
      cadre(ETAPES[3],
        '<div class="lec-consigne">Écoute, puis répète à voix haute :</div>' +
        '<div class="lec-gros" style="font-size:52px">' + m.emoji + '</div>' +
        '<div class="lec-gros">' + m.mot + '</div>' +
        '<button class="lec-ecouter" id="lec-ecouter">🔊 Écouter</button>' +
        '<div><button class="lec-bouton-suite" id="lec-suite">✅ J\'ai répété</button></div>' +
        '<div class="lec-avance">' + (i + 1) + ' / ' + mots.length + '</div>'
      );
      conteneur.querySelector("#lec-ecouter").addEventListener("click", () => parler(m.mot));
      setTimeout(() => parler(m.mot), 300);
      conteneur.querySelector("#lec-suite").addEventListener("click", () => { i++; setProg("prononcer", (i / mots.length) * 100); afficher(); });
    }
    afficher();
  }
  function etapeMots() {
    const mots = echantillon(MOTS, 6);
    let i = 0;
    function afficher() {
      if (i >= mots.length) { setProg("mots", 100); cadreFin(ETAPES[4]); return; }
      const m = mots[i];
      cadre(ETAPES[4],
        '<div class="lec-consigne">Remets les syllabes dans l\'ordre :</div>' +
        '<div class="lec-gros" style="font-size:56px">' + m.emoji + '</div>' +
        '<div class="lec-slots" id="lec-slots"></div>' +
        '<div class="lec-options" id="lec-syls">' +
        melanger(m.syllabes.slice()).map((s, idx) => '<button class="lec-syl" data-s="' + s + '" data-idx="' + idx + '">' + s + '</button>').join("") +
        '</div><div class="lec-avance">' + (i + 1) + ' / ' + mots.length + '</div>'
      );
      const slots = conteneur.querySelector("#lec-slots");
      const choisis = [];
      conteneur.querySelectorAll(".lec-syl").forEach((b) => b.addEventListener("click", () => {
        if (b.disabled) return;
        b.disabled = true; b.style.opacity = 0.35;
        choisis.push(b.dataset.s);
        slots.innerHTML = choisis.map((s) => '<span class="lec-slot">' + s + '</span>').join("");
        if (choisis.length === m.syllabes.length) {
          if (choisis.join("") === m.syllabes.join("")) {
            parler(m.mot); feedback(true, "⭐ " + m.mot + " !");
            setProg("mots", ((i + 1) / mots.length) * 100);
            setTimeout(() => { i++; afficher(); }, 1100);
          } else {
            feedback(false, "😊 Essaie encore.");
            setTimeout(afficher, 1100);
          }
        }
      }));
    }
    afficher();
  }
  function etapeComprendre() {
    const t = echantillon(TEXTES, 1)[0];
    let qi = 0;
    function afficher() {
      if (qi >= t.questions.length) { setProg("comprendre", 100); cadreFin(ETAPES[6]); return; }
      const q = t.questions[qi];
      cadre(ETAPES[6],
        '<div class="lec-texte">' + t.texte + '</div>' +
        '<button class="lec-ecouter" id="lec-ecouter">🔊 Écouter l\'histoire</button>' +
        '<div class="lec-consigne">' + q.q + '</div>' +
        '<div class="lec-options">' +
        q.options.map((o, idx) => '<button class="lec-opt lec-opt-texte" data-ok="' + (idx === q.bonne) + '">' + o + '</button>').join("") +
        '</div><div class="lec-avance">Question ' + (qi + 1) + ' / ' + t.questions.length + '</div>'
      );
      conteneur.querySelector("#lec-ecouter").addEventListener("click", () => parler(t.texte));
      conteneur.querySelectorAll(".lec-opt").forEach((b) => b.addEventListener("click", () => {
        if (b.disabled) return;
        if (b.dataset.ok === "true") {
          b.classList.add("bon"); feedback(true, "⭐ Bravo !");
          conteneur.querySelectorAll(".lec-opt").forEach((x) => (x.disabled = true));
          setProg("comprendre", ((qi + 1) / t.questions.length) * 100);
          setTimeout(() => { qi++; afficher(); }, 1000);
        } else { b.classList.add("mauvais"); b.disabled = true; feedback(false, "😊 Relis l'histoire."); }
      }));
    }
    afficher();
  }

  function rendreEtape(id) {
    const map = { lettres: etapeLettres, sons: etapeSons, syllabes: etapeSyllabes, prononcer: etapePrononcer, mots: etapeMots, phrases: etapePhrases, comprendre: etapeComprendre };
    (map[id] || rendreAccueil)();
  }

  // ---------- Style (injecté une seule fois) ----------
  function injecterStyle() {
    if (document.getElementById("style-lecture-cp")) return;
    const s = document.createElement("style");
    s.id = "style-lecture-cp";
    s.textContent = [
      "#module-lecture{--lf:#1c3025;--la:#e8b75c;--lc:#f2efe2;color:var(--lc);}",
      ".lec-entete{display:flex;align-items:center;gap:14px;margin:6px 0 18px;}",
      ".lec-prof{font-size:48px;}",
      ".lec-bonjour{font-size:19px;font-weight:600;}",
      ".lec-classe{font-size:13px;color:#9caa9f;}",
      ".lec-continuer{width:100%;background:linear-gradient(90deg,#5b9bd5,#e8b75c);color:#16241d;border:none;border-radius:14px;padding:16px;font-size:17px;font-weight:700;cursor:pointer;margin-bottom:20px;}",
      ".lec-etapes{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;}",
      ".lec-etape{display:flex;align-items:center;gap:12px;background:var(--lf);border:1px solid rgba(242,239,226,.12);border-radius:14px;padding:14px;cursor:pointer;color:var(--lc);text-align:left;}",
      ".lec-etape:hover{border-color:var(--la);}",
      ".lec-etape-ico{font-size:30px;}",
      ".lec-etape-txt{display:flex;flex-direction:column;flex:1;}",
      ".lec-etape-txt small{color:#9caa9f;font-size:12px;}",
      ".lec-barre{display:inline-block;height:7px;background:rgba(242,239,226,.14);border-radius:5px;overflow:hidden;flex:1;min-width:60px;}",
      ".lec-barre-in{display:block;height:100%;background:var(--la);}",
      ".lec-progression-titre{margin:24px 0 8px;color:var(--la);font-weight:600;}",
      ".lec-progression{background:var(--lf);border-radius:14px;padding:12px 14px;}",
      ".lec-prog-ligne{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:13px;}",
      ".lec-prog-ligne>span:first-child{width:160px;}",
      ".lec-pct{width:42px;text-align:right;color:#9caa9f;}",
      ".lec-retour{background:transparent;border:.5px solid rgba(242,239,226,.2);color:var(--lc);border-radius:10px;padding:7px 12px;cursor:pointer;margin-bottom:12px;}",
      ".lec-titre-etape{margin:4px 0 16px;}",
      ".lec-texte{font-size:20px;line-height:1.6;background:var(--lf);border-radius:12px;padding:14px 16px;margin-bottom:14px;}",
      ".lec-consigne{font-size:19px;margin:6px 0 16px;}",
      ".lec-gros{font-size:64px;font-weight:800;text-align:center;color:var(--la);margin:8px 0;letter-spacing:3px;}",
      ".lec-ecouter{background:#5b9bd5;color:#16241d;border:none;border-radius:12px;padding:12px 18px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:14px;}",
      ".lec-options{display:flex;flex-wrap:wrap;gap:12px;}",
      ".lec-opt{min-width:84px;min-height:84px;font-size:32px;font-weight:800;background:var(--lf);border:2px solid rgba(242,239,226,.15);border-radius:16px;color:var(--lc);cursor:pointer;padding:10px 18px;}",
      ".lec-opt.lec-opt-texte{font-size:16px;min-height:auto;min-width:auto;padding:12px 16px;font-weight:600;}",
      ".lec-opt:hover:not(:disabled){border-color:var(--la);}",
      ".lec-opt.bon{background:#2e7d5b;border-color:#2e7d5b;}",
      ".lec-opt.mauvais{opacity:.45;}",
      ".lec-avance{margin-top:16px;color:#9caa9f;font-size:13px;}",
      ".lec-feedback{margin-top:14px;padding:10px 14px;border-radius:12px;font-size:16px;display:inline-block;}",
      ".lec-feedback.ok{background:rgba(46,125,91,.25);color:#8ee0b7;}",
      ".lec-feedback.ko{background:rgba(232,183,92,.18);color:var(--la);}",
      ".lec-slots{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0;min-height:58px;}",
      ".lec-slot{min-width:58px;min-height:54px;border:2px solid rgba(232,183,92,.5);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:var(--la);padding:0 10px;}",
      ".lec-syl{font-size:24px;font-weight:800;background:var(--lf);border:2px solid rgba(232,183,92,.4);border-radius:12px;color:var(--la);padding:12px 20px;cursor:pointer;}",
      ".lec-bouton-suite{background:var(--la);color:#16241d;border:none;border-radius:12px;padding:12px 22px;font-weight:700;cursor:pointer;margin-top:8px;}",
      ".lec-fin{text-align:center;padding:24px;}",
      ".lec-fin-emoji{font-size:66px;}",
    ].join("");
    document.head.appendChild(s);
  }

  // ---------- Point d'entrée public ----------
  window.ouvrirModuleLecture = function (classe, container) {
    classeActuelle = classe === "CP2" ? "CP2" : "CP1";
    conteneur = container || document.getElementById("module-lecture");
    if (!conteneur) return;
    injecterStyle();
    if ("speechSynthesis" in window) { window.speechSynthesis.getVoices(); }
    rendreAccueil();
  };
})();
