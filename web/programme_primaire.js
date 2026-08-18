/* =============================================================
   INO-Education — Programme du primaire (Burkina Faso)
   Classe  ->  Matières  ->  Technique pédagogique officielle
   Source : curricula de l'éducation de base (MENAPLN), démarche
   API / ASEI-PDSI / Pédagogie du Texte.
   Ce fichier est chargé AVANT script.js.
   ============================================================= */

// ---- Matières par classe du primaire ----
const MATIERES_PAR_CLASSE = {
  "CP1": ["Langage (expression orale)", "Lecture", "Écriture", "Mathématiques", "Exercices d'observation", "Éducation civique et morale", "EPS", "Chant", "Dessin"],
  "CP2": ["Langage (expression orale)", "Lecture", "Écriture", "Mathématiques", "Exercices d'observation", "Éducation civique et morale", "EPS", "Chant", "Dessin"],
  "CE1": ["Lecture", "Vocabulaire", "Grammaire", "Conjugaison", "Orthographe", "Expression écrite", "Mathématiques", "Sciences d'observation", "Histoire", "Géographie", "Éducation civique et morale", "EPS", "Dessin", "Chant", "Activités pratiques de production"],
  "CE2": ["Lecture", "Vocabulaire", "Grammaire", "Conjugaison", "Orthographe", "Expression écrite", "Mathématiques", "Sciences d'observation", "Histoire", "Géographie", "Éducation civique et morale", "EPS", "Dessin", "Chant", "Activités pratiques de production"],
  "CM1": ["Lecture", "Vocabulaire", "Grammaire", "Conjugaison", "Orthographe", "Expression écrite", "Mathématiques", "Sciences d'observation", "Histoire", "Géographie", "Éducation civique et morale", "EPS", "Dessin", "Chant", "Activités pratiques de production"],
  "CM2": ["Lecture", "Vocabulaire", "Grammaire", "Conjugaison", "Orthographe", "Expression écrite", "Mathématiques", "Sciences d'observation", "Histoire", "Géographie", "Éducation civique et morale", "EPS", "Dessin", "Chant", "Activités pratiques de production"],
};

// ---- Technique officielle par famille de matière ----
// (mots-clés -> technique courte + consigne pour l'IA)
const PROFILS_PEDAGOGIQUES = [
  { motscles: ["math", "calcul", "numérat", "numerat", "géométr", "geometr"],
    technique: "ASEI-PDSI (manipulation → règle → utilité)",
    guideIA: "Applique la démarche ASEI-PDSI : commence par une activité concrète où l'élève manipule des objets simples du quotidien, fais découvrir la notion par l'expérimentation avant d'énoncer la règle, puis montre à quoi elle sert dans la vie de tous les jours." },

  { motscles: ["scienc", "observ", "éveil", "eveil", "svt", "nature"],
    technique: "ASEI-PDSI (observation & expérimentation)",
    guideIA: "Suis la démarche ASEI-PDSI : pars d'une observation ou d'une petite expérience tirée du milieu de l'enfant, laisse-le formuler des hypothèses, puis dégage la conclusion et son utilité pratique." },

  { motscles: ["lecture"],
    technique: "Méthode mixte (phrase-clé → mot-clé → son)",
    guideIA: "Pour la lecture, pars d'une phrase-clé simple liée au vécu, isole un mot-clé puis le son étudié, propose des mots, de courtes phrases et un petit texte, et vérifie la compréhension." },

  { motscles: ["langage", "expression oral"],
    technique: "Présentation-répétition-réemploi (mimes, jeux de rôle)",
    guideIA: "Pour le langage, construis la séance en trois temps (présentation/répétition, consolidation, réemploi) et propose des mises en situation, mimes ou jeux de rôle pour réutiliser le vocabulaire." },

  { motscles: ["écriture", "ecriture", "graphi"],
    technique: "Geste graphique, en lien avec la lecture",
    guideIA: "Pour l'écriture, relie-la à la lecture du jour, décris le tracé des lettres étape par étape et propose des modèles à copier (syllabes, mots, courtes phrases)." },

  { motscles: ["grammair", "conjug", "orthograph", "vocabulair", "expression écrite", "expression ecrite", "rédaction", "redaction", "français", "francais"],
    technique: "Pédagogie du Texte + APC (observer → découvrir la règle → appliquer)",
    guideIA: "Procède par observation d'un court exemple ou corpus, fais découvrir la règle par l'élève, puis fais-la appliquer avec des exercices gradués tirés de situations réelles." },

  { motscles: ["histoire"],
    technique: "Documents et situation dans le temps",
    guideIA: "Pour l'histoire, appuie-toi sur des faits adaptés à l'âge, situe les événements dans le temps et relie-les au vécu et à l'environnement de l'enfant au Burkina Faso." },

  { motscles: ["géograph", "geograph"],
    technique: "Observation du milieu et cartes",
    guideIA: "Pour la géographie, pars du milieu proche de l'élève (école, village, région) avant d'élargir, avec des croquis et des cartes simples." },

  { motscles: ["civique", "morale", "ecm", "citoyen"],
    technique: "Mises en situation, jeux de rôle et débats",
    guideIA: "Pour l'éducation civique et morale, pars d'une situation concrète de la vie de classe ou du village, fais réagir par un jeu de rôle ou un court débat, puis dégage la valeur ou la règle de conduite." },

  { motscles: ["eps", "sport", "physique"],
    technique: "Démonstration puis pratique",
    guideIA: "Pour l'EPS, donne une consigne simple et sûre, décris la démonstration du geste, puis l'activité pratique et un retour au calme." },

  { motscles: ["dessin", "art", "musique", "chant"],
    technique: "Observation, imitation et création",
    guideIA: "Pour les arts, propose un modèle à observer, une phase d'imitation guidée, puis un temps de création personnelle." },

  { motscles: ["production", "pratique", "jardin", "manuel"],
    technique: "Manipulation et production concrète",
    guideIA: "Pour les activités pratiques de production, organise une réalisation concrète étape par étape (jardinage, petit objet…) avec un lien clair vers l'utilité pour le milieu." },
];

const PROFIL_DEFAUT = {
  technique: "Approche Pédagogique Intégratrice (centrée sur l'élève)",
  guideIA: "Reste centré sur l'élève : pars de son vécu, fais-le participer activement et relie la notion à une utilité concrète.",
};

// Retourne { technique, guideIA } pour une matière (texte libre)
function profilPedagogique(matiere) {
  const m = (matiere || "").toLowerCase();
  for (const p of PROFILS_PEDAGOGIQUES) {
    if (p.motscles.some((k) => m.includes(k))) return p;
  }
  return PROFIL_DEFAUT;
}

// Est-ce une classe du primaire ?
function estClassePrimaire(classe) {
  return Object.prototype.hasOwnProperty.call(MATIERES_PAR_CLASSE, classe);
}

// Consigne à ajouter au prompt de l'IA (seulement pour le primaire)
function instructionPedagogique(matiere, classe) {
  if (!estClassePrimaire(classe)) return "";
  const p = profilPedagogique(matiere);
  return " Méthode pédagogique à appliquer (programme burkinabè) : " + p.guideIA;
}

// Remplit la liste de suggestions de matières selon la classe
function remplirMatieresDatalist(classe) {
  const dl = document.getElementById("liste-matieres");
  if (!dl) return;
  const liste = MATIERES_PAR_CLASSE[classe] || [];
  dl.innerHTML = liste.map((mat) => `<option value="${mat}"></option>`).join("");
}

// Affiche les matières de la classe sous forme de puces cliquables
function afficherPucesMatieres(containerId, input, classe) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const liste = MATIERES_PAR_CLASSE[classe] || [];
  if (!liste.length) { box.innerHTML = ""; box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = '<span class="puces-matieres-titre">Matières de la classe — choisis-en une :</span>' +
    liste.map((mat) => `<button type="button" class="puce-matiere">${mat}</button>`).join("");
  box.querySelectorAll(".puce-matiere").forEach((b) => {
    b.addEventListener("click", () => {
      if (input) { input.value = b.textContent; input.dispatchEvent(new Event("change")); }
      box.querySelectorAll(".puce-matiere").forEach((x) => x.classList.remove("actif"));
      b.classList.add("actif");
    });
  });
}

// Icône (emoji) par matière, pour les grandes cartes
function iconeMatiere(matiere) {
  const m = (matiere || "").toLowerCase();
  const paires = [
    [["lecture"], "📖"], [["écriture", "ecriture"], "✍️"], [["langage"], "🗣️"],
    [["vocabulair"], "🔤"], [["grammair"], "📝"], [["conjug"], "🔗"], [["orthograph"], "✏️"],
    [["expression écrite", "expression ecrite", "rédaction", "redaction"], "📄"],
    [["math", "calcul"], "🔢"], [["scienc", "observ"], "🔬"], [["histoire"], "🏛️"],
    [["géograph", "geograph"], "🗺️"], [["civique", "morale", "ecm"], "⚖️"],
    [["eps", "sport"], "🤸"], [["dessin", "art"], "🎨"], [["chant", "musique"], "🎵"],
    [["production", "pratique", "manuel", "jardin"], "🛠️"],
  ];
  for (const [mots, ico] of paires) { if (mots.some((k) => m.includes(k))) return ico; }
  return "📚";
}
