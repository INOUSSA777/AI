const filConversation = document.getElementById("fil-conversation");
const formulaire = document.getElementById("formulaire-saisie");
const entreeTexte = document.getElementById("entree-texte");
const entreeFichier = document.getElementById("entree-fichier");
const zoneImageActive = document.getElementById("zone-image-active");
const apercuImage = document.getElementById("apercu-image");
const retirerImageBtn = document.getElementById("retirer-image");
const boutonMicro = document.getElementById("bouton-micro");
const btnEffacer = document.getElementById("btn-effacer");
const statutEl = document.getElementById("statut-api");
const statutTexte = document.getElementById("statut-texte");
const selecteurLangue = document.getElementById("selecteur-langue");
const selecteurStatut = document.getElementById("selecteur-statut");
const boutonsModes = document.querySelectorAll(".mode-btn");
const formulaireEtude = document.getElementById("formulaire-etude");
const etudeParcours = document.getElementById("etude-parcours");
const etudeMatiere = document.getElementById("etude-matiere");
const etudeSujet = document.getElementById("etude-sujet");
const ecranEtude = document.getElementById("ecran-etude");
const ecranConcours = document.getElementById("ecran-concours");
const ecranBibliotheque = document.getElementById("ecran-bibliotheque");
const boutonStopAudio = document.getElementById("bouton-stop-audio");
const boutonFermerMenu = document.getElementById("bouton-fermer-menu");
const boutonOuvrirMenu = document.getElementById("bouton-ouvrir-menu");
const appConteneur = document.querySelector(".app");

let audioActuel = null; // référence vers le son en cours, pour pouvoir le stopper

let historique = [];
let imageSelectionnee = null; // { fichier, dataUrl }
let modeActif = "chat";
let bibliothequePhrases = []; // texte de chaque phrase, indexé pour les boutons audio

// ============================================================
// TRADUCTION DE L'INTERFACE
// ============================================================
// Remarque sur le mooré : traduction de base, faite au mieux.
// Les termes techniques de navigation n'ont pas toujours d'équivalent
// figé en mooré écrit — à faire relire par un locuteur natif si tu veux
// une version parfaitement idiomatique.
const TRADUCTIONS = {
  fr: {
    sousTitre: "Assistant éducatif",
    modeChat: "Assistant IA",
    modeEtude: "Étudier avec moi",
    modeOrientation: "Orientation",
    modeImage: "Analyser une image",
    modeGeneration: "Générer une image",
    labelLangue: "Langue de conversation",
    btnEffacer: "Effacer la session",
    statutVerification: "Vérification…",
    statutConnecte: "Connecté",
    statutCleManquante: "Clé API manquante (.env)",
    statutInjoignable: "Backend injoignable",
    messageAccueil: 'Bonjour, je suis <strong>INOUS.AI</strong>. Choisis un mode à gauche : discute avec moi, lance une séance d\'étude guidée, explore une orientation, ou analyse/génère une image.',
    titreJoindre: "Joindre une image",
    titreParler: "Parler",
    titreParlerImage: "Décrire à la voix",
    placeholderTexte: "Écris ta question ici…",
    placeholderImage: "Décris l'image que tu veux générer…",
    btnEnvoyer: "Envoyer",
    btnGenerer: "🎨 Générer",
    reflexion: "INOUS.AI réfléchit…",
    transcriptionEnCours: "Transcription en cours…",
    generationEnCours: "Génération de l'image en cours…",
    sessionEffacee: "Session effacée. On repart de zéro !",
    micIndisponible: "⚠️ Impossible d'accéder au micro.",
    erreurInconnue: "Erreur inconnue",
    audioIndisponibleMoore: "🔇 Lecture audio non disponible en mooré pour le moment.",
    descriptionParDefaut: "Décris cette image en détail.",
    actionExpliquer: "Expliquer",
    actionResumer: "Résumer",
    actionInterroger: "Interroge-moi",
    actionExercice: "Crée un exercice",
    actionCorriger: "Corrige mon devoir",
    actionAutrement: "Explique autrement",
    actionExemple: "Exemple burkinabè",
    etudeTitre: "Étudier avec moi",
    etudeDesc: "Choisis ton niveau et ta matière, décris le sujet — INOUS.AI construit une séance complète : explication, exemple, questions et exercices.",
    etudeLabelNiveau: "Niveau",
    etudeLabelParcours: "Parcours",
    etudePlanTitre: "Plan de la séance",
    etapeCours: "Cours", etapeCoursDesc: "Comprendre la leçon",
    etapeExemple: "Exemple", etapeExempleDesc: "Voir un cas résolu",
    etapeQuiz: "Quiz", etapeQuizDesc: "Vérifier ta compréhension",
    etapeExercices: "Exercices", etapeExercicesDesc: "S'entraîner",
    etapeCorrection: "Correction", etapeCorrectionDesc: "Voir les corrigés",
    etapeBilan: "Bilan", etapeBilanDesc: "Fin de séance",
    etudeNoteSession: "ℹ️ Cette progression concerne uniquement la séance en cours — elle repart de zéro si tu quittes la page.",
    etudeOutilsTitre: "Outils d'aide",
    etudeOutilResume: "Résumé du cours",
    etudeEcouterCours: "Écouter le cours",
    etudePrecedent: "Précédent",
    etudeSuivant: "Suivant",
    etudeExercicesIntro: "Voici 4 exercices générés pour t'entraîner :",
    etudePasExercices: "Passe d'abord par l'étape Exercices pour générer des exercices à corriger.",
    etudeVoirCorrige: "Voir le corrigé",
    niveauPrimaire: "Primaire (CP à CM2)",
    niveauCollege: "Collège (6e à 3e)",
    niveauLycee: "Lycée (2nde à Terminale)",
    niveauUniversite: "Université",
    niveauFormation: "Formation professionnelle",
    etudeLabelMatiere: "Matière",
    etudePlaceholderMatiere: "Ex : Mathématiques, SVT, Histoire…",
    etudeLabelSujet: "Sujet ou chapitre",
    etudePlaceholderSujet: "Ex : les fractions, la photosynthèse…",
    etudeBouton: "Commencer la séance",
    orientationTitre: "Orientation",
    orientationDesc: "Décris ta situation, INOUS.AI te propose un parcours indicatif : filières, compétences, débouchés.",
    orientationLabelDiplome: "Dernier diplôme obtenu (ou en préparation)",
    diplomeCEP: "CEP",
    diplomeBEPC: "BEPC",
    diplomeBac: "Baccalauréat",
    diplomeLicence: "Licence",
    orientationLabelMetier: "Métier ou domaine qui t'intéresse",
    orientationPlaceholderMetier: "Ex : médecine, informatique, enseignement…",
    orientationBouton: "Obtenir mon parcours",
    orientationAvertissement: "ℹ️ Les informations sur les écoles, admissions et salaires sont générées par l'IA à titre indicatif — vérifie toujours auprès des établissements officiels avant de décider.",
    etudePromptModele: "Je suis en {niveau}. Je veux étudier le sujet suivant en {matiere} : {sujet}. Fais une séance complète : 1) une explication claire adaptée à mon niveau, 2) un exemple concret lié au contexte du Burkina Faso, 3) deux ou trois questions pour vérifier ma compréhension, 4) deux exercices à faire. Attends mes réponses avant de me donner la correction. Structure ta réponse avec un retour à la ligne entre chaque idée.",
    orientationPromptModele: "Je viens d'obtenir (ou je prépare) le diplôme suivant : {diplome}. Le métier ou domaine qui m'intéresse est : {metier}. Propose-moi : 1) un parcours recommandé (filières, écoles), 2) les compétences nécessaires, 3) les débouchés possibles, 4) si pertinent, des écoles ou universités au Burkina Faso ou dans la sous-région. Structure ta réponse avec un retour à la ligne entre chaque idée.",
    modeConcours: "Prépa Concours",
    anticipationsIntro: "Ça pourrait aussi t'intéresser :",
    modeBibliotheque: "Bibliothèque",
    biblioPasDeDocument: "⚠️ Importe d'abord un PDF avant de pouvoir l'utiliser.",
    biblioTitre: "Bibliothèque intelligente",
    biblioDesc: "Importe un document PDF et discute avec son contenu — résumé, quiz, questions, tout est généré pendant ta session.",
    biblioHeroTitre: "Transforme un document en apprentissage",
    biblioHeroDesc: "Importe un PDF (cours, annale, article) et pose-lui des questions, fais-en un résumé, ou génère un quiz dessus.",
    biblioImporter: "Importer un PDF",
    biblioQueVeuxTu: "Que veux-tu faire avec ce document ?",
    biblioResumer: "Résumer le document",
    biblioQuiz: "Créer un quiz dessus",
    biblioFiche: "Créer une fiche de révision",
    biblioQuestion: "Poser une question précise",
    biblioPlaceholderQuestion: "Ta question sur ce document…",
    biblioEnvoyer: "Envoyer",
    biblioNote: "ℹ️ Rien n'est sauvegardé sur le serveur : le document reste en mémoire seulement pendant que cette page est ouverte.",
    modeJeux: "Jeux pour enfants",
    jeuxTitre: "Jeux pour enfants",
    jeuxDesc: "Des petits quiz amusants générés par l'IA pour s'entraîner en s'amusant — calcul, vocabulaire, culture générale.",
    jeuxLabelType: "Type de jeu",
    jeuxTypeCalcul: "🔢 Quiz de calcul",
    jeuxTypeVocabulaire: "📖 Quiz de vocabulaire",
    jeuxTypeCulture: "🌍 Quiz de culture générale",
    jeuxLabelNiveau: "Niveau",
    jeuxBouton: "Commencer à jouer",
    jeuxPreparation: "Préparation du jeu…",
    jeuxErreur: "Le jeu n'a pas pu être généré. Réessaie.",
    jeuxRejouer: "🔁 Rejouer",
    jeuxSuivant: "Suivant →",
    jeuxTermine: "Bonne question ! Fin du quiz.",
    jeuxScoreTexte: "Ton score : {score} / {total}",
    btnStopAudio: "Stopper l'audio",
  },
  en: {
    sousTitre: "Educational assistant",
    modeChat: "AI Assistant",
    modeEtude: "Study with me",
    modeOrientation: "Career guidance",
    modeImage: "Analyze an image",
    modeGeneration: "Generate an image",
    labelLangue: "Conversation language",
    btnEffacer: "Clear session",
    statutVerification: "Checking…",
    statutConnecte: "Connected",
    statutCleManquante: "Missing API key (.env)",
    statutInjoignable: "Backend unreachable",
    messageAccueil: 'Hello, I\'m <strong>INOUS.AI</strong>. Pick a mode on the left: chat with me, start a guided study session, explore career guidance, or analyze/generate an image.',
    titreJoindre: "Attach an image",
    titreParler: "Speak",
    titreParlerImage: "Describe with your voice",
    placeholderTexte: "Type your question here…",
    placeholderImage: "Describe the image you want to generate…",
    btnEnvoyer: "Send",
    btnGenerer: "🎨 Generate",
    reflexion: "INOUS.AI is thinking…",
    transcriptionEnCours: "Transcribing…",
    generationEnCours: "Generating the image…",
    sessionEffacee: "Session cleared. Starting fresh!",
    micIndisponible: "⚠️ Couldn't access the microphone.",
    erreurInconnue: "Unknown error",
    audioIndisponibleMoore: "🔇 Audio playback isn't available in Mooré yet.",
    descriptionParDefaut: "Describe this image in detail.",
    actionExpliquer: "Explain",
    actionResumer: "Summarize",
    actionInterroger: "Quiz me",
    actionExercice: "Create an exercise",
    actionCorriger: "Correct my homework",
    actionAutrement: "Explain differently",
    actionExemple: "Burkinabè example",
    etudeTitre: "Study with me",
    etudeDesc: "Pick your level and subject, describe the topic — INOUS.AI builds a full session: explanation, example, questions and exercises.",
    etudeLabelNiveau: "Level",
    etudeLabelParcours: "Track",
    niveauPrimaire: "Primary school",
    niveauCollege: "Middle school",
    niveauLycee: "High school",
    niveauUniversite: "University",
    niveauFormation: "Vocational training",
    etudeLabelMatiere: "Subject",
    etudePlaceholderMatiere: "E.g. Math, Biology, History…",
    etudeLabelSujet: "Topic or chapter",
    etudePlaceholderSujet: "E.g. fractions, photosynthesis…",
    etudeBouton: "Start the session",
    orientationTitre: "Career guidance",
    orientationDesc: "Describe your situation, INOUS.AI suggests an indicative path: fields, skills, career prospects.",
    orientationLabelDiplome: "Last diploma obtained (or in progress)",
    diplomeCEP: "Primary school certificate",
    diplomeBEPC: "Middle school certificate",
    diplomeBac: "High school diploma",
    diplomeLicence: "Bachelor's degree",
    orientationLabelMetier: "Career or field you're interested in",
    orientationPlaceholderMetier: "E.g. medicine, computer science, teaching…",
    orientationBouton: "Get my path",
    orientationAvertissement: "ℹ️ Information about schools, admissions and salaries is AI-generated and indicative only — always verify with official institutions before deciding.",
    etudePromptModele: "I'm at the {niveau} level. I want to study the following topic in {matiere}: {sujet}. Build a full session: 1) a clear explanation suited to my level, 2) a concrete example tied to Burkina Faso, 3) two or three comprehension questions, 4) two exercises. Wait for my answers before giving the correction. Structure your answer with a line break between each idea.",
    orientationPromptModele: "I have just obtained (or am preparing) the following diploma: {diplome}. The career or field I'm interested in is: {metier}. Suggest: 1) a recommended path (fields, schools), 2) the skills needed, 3) possible career outcomes, 4) if relevant, schools or universities in Burkina Faso or the region. Structure your answer with a line break between each idea.",
    modeJeux: "Kids' games",
    jeuxTitre: "Kids' games",
    jeuxDesc: "Fun little AI-generated quizzes to practice while having fun — math, vocabulary, general knowledge.",
    jeuxLabelType: "Game type",
    jeuxTypeCalcul: "🔢 Math quiz",
    jeuxTypeVocabulaire: "📖 Vocabulary quiz",
    jeuxTypeCulture: "🌍 General knowledge quiz",
    jeuxLabelNiveau: "Level",
    jeuxBouton: "Start playing",
    jeuxPreparation: "Preparing the game…",
    jeuxErreur: "The game couldn't be generated. Try again.",
    jeuxRejouer: "🔁 Play again",
    jeuxSuivant: "Next →",
    jeuxTermine: "Good question! Quiz finished.",
    jeuxScoreTexte: "Your score: {score} / {total}",
    btnStopAudio: "Stop audio",
  },
  moore: {
    sousTitre: "Karen-sõngda (assistant éducatif)",
    modeChat: "Karen-sõngda IA",
    modeEtude: "Zãms ne mam",
    modeOrientation: "Sore-tũub",
    modeImage: "Fo foto ges-gu",
    modeGeneration: "Foto naaneg",
    labelLangue: "Goam sẽn na n tũ",
    btnEffacer: "Yiisi gomd-kãngã",
    statutVerification: "D gũusda…",
    statutConnecte: "Yaa vẽeneg",
    statutCleManquante: "Zĩmb-koɛɛg ka be ye (.env)",
    statutInjoignable: "D ka tõe n paas serveur ye",
    messageAccueil: 'Ne y windiga, mam yaa <strong>INOUS.AI</strong>. Yãk zãmsg sẽn be goabga: gom ne mam, sɩng zãmsg sõng, bãng sore-tũub, wall ges/naan foto.',
    titreJoindre: "Paas foto",
    titreParler: "Gom",
    titreParlerImage: "Wilg ne koɛɛg",
    placeholderTexte: "Gʋls f sokre ka…",
    placeholderImage: "Wilg foto ning fo sẽn dat…",
    btnEnvoyer: "Tʋm",
    btnGenerer: "🎨 Naan",
    reflexion: "INOUS.AI yaa tags…",
    transcriptionEnCours: "D gʋlsda koɛɛg…",
    generationEnCours: "D naanda foto…",
    sessionEffacee: "Gomd-kãngã yiisame. D sɩngame paalem.",
    micIndisponible: "⚠️ Pa tõe n dɩk koɛɛg ye.",
    erreurInconnue: "Yell-kãseng sẽn ka vẽeneg",
    audioIndisponibleMoore: "🔇 Koɛɛg-lebgre ka be moore ye ka la.",
    descriptionParDefaut: "Wilg foto kãngã ne bãane.",
    actionExpliquer: "Wilg",
    actionResumer: "Sõbg-sõma",
    actionInterroger: "Sok-m",
    actionExercice: "Naan zãmsg-toog",
    actionCorriger: "Ges m tʋʋmd",
    actionAutrement: "Wilg toor toor",
    actionExemple: "Makre Burkina Faso",
    etudeTitre: "Zãms ne mam",
    etudeDesc: "Yãk f karengã la f zãmsgã, wilg-y sẽn dat n zãms — INOUS.AI na naan zãmsg zãnga.",
    etudeLabelNiveau: "Kareng-zug",
    etudeLabelParcours: "Karen-sore",
    niveauPrimaire: "Piiri (CP tɩ ta CM2)",
    niveauCollege: "Kolezi (6e tɩ ta 3e)",
    niveauLycee: "Lise (2nde tɩ ta Tle)",
    niveauUniversite: "Iniversite",
    niveauFormation: "Tʋʋm-zãmsg",
    etudeLabelMatiere: "Zãmsg",
    etudePlaceholderMatiere: "Mak. Sɩɩb, SVT, Kibare…",
    etudeLabelSujet: "Yel-kãngã",
    etudePlaceholderSujet: "Mak. sik-yaare, foto-tɩgs…",
    etudeBouton: "Sɩng zãmsgã",
    orientationTitre: "Sore-tũub",
    orientationDesc: "Wilg f zĩig, INOUS.AI na kõ-f sore-tũub sõngo.",
    orientationLabelDiplome: "Diplome ning fo sẽn paam (bɩ f sẽn segd n paame)",
    diplomeCEP: "CEP",
    diplomeBEPC: "BEPC",
    diplomeBac: "Bakalorea",
    diplomeLicence: "Lisãns",
    orientationLabelMetier: "Tʋʋmd ning fo sẽn dat",
    orientationPlaceholderMetier: "Mak. logtoore, ordinatoor-tʋʋmde, karen-sõng-tʋʋmde…",
    orientationBouton: "Paam m soore",
    orientationAvertissement: "ℹ️ Kibay sẽn gomd karen-zĩis, deem la ligd wɛɛngẽ yaa IA sẽn naan-b, ka sɩd-vãeg ye — kos-y n bãng ne karen-zĩis meng-menga nengẽ.",
    modeJeux: "Kãabg-tʋʋm biig",
    jeuxTitre: "Kãabg-tʋʋm biig",
    jeuxDesc: "Kãabg-tʋʋm nins IA sẽn naan n sõng-y tɩ y zãms n get-y a noore.",
    jeuxLabelType: "Kãabg-buud",
    jeuxTypeCalcul: "🔢 Sik-yaare kãabg",
    jeuxTypeVocabulaire: "📖 Gom-buud kãabg",
    jeuxTypeCulture: "🌍 Bãngr kãabg",
    jeuxLabelNiveau: "Kareng-zug",
    jeuxBouton: "Sɩng kãabgã",
    jeuxPreparation: "D naanda kãabgã…",
    jeuxErreur: "Kãabgã pa tõog n naam ye. Le-y maane.",
    jeuxRejouer: "🔁 Le-y maane",
    jeuxSuivant: "Taoore →",
    jeuxTermine: "Sokre sõma! Kãabgã sɛɛ.",
    jeuxScoreTexte: "Fo maree: {score} / {total}",
    btnStopAudio: "Gɩdg koɛɛgã",
  },
};

function texteTraduit(cle) {
  const langue = selecteurLangue.value;
  return (TRADUCTIONS[langue] && TRADUCTIONS[langue][cle]) || TRADUCTIONS.fr[cle] || cle;
}

function appliquerLangue() {
  const langue = selecteurLangue.value;
  document.documentElement.lang = langue === "moore" ? "mos" : langue;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = texteTraduit(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = texteTraduit(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = texteTraduit(el.dataset.i18nTitle);
  });
  const accueil = document.getElementById("message-accueil");
  if (accueil) accueil.innerHTML = texteTraduit("messageAccueil");

  // Le statut affiché dépend aussi de l'état de connexion déjà connu
  if (statutEl.classList.contains("pret")) {
    statutTexte.textContent = texteTraduit("statutConnecte");
  } else if (statutEl.classList.contains("erreur")) {
    statutTexte.textContent = statutTexte.dataset.cleManquante === "1"
      ? texteTraduit("statutCleManquante")
      : texteTraduit("statutInjoignable");
  } else {
    statutTexte.textContent = texteTraduit("statutVerification");
  }
}

selecteurLangue.addEventListener("change", appliquerLangue);

// ---------- déplier/replier le panneau Paramètres ----------
document.getElementById("btn-parametres").addEventListener("click", () => {
  const panneau = document.getElementById("panneau-parametres");
  const bouton = document.getElementById("btn-parametres");
  panneau.hidden = !panneau.hidden;
  bouton.classList.toggle("parametres-ouverts", !panneau.hidden);
});

// ---------- replier / déplier le menu latéral ----------
boutonFermerMenu.addEventListener("click", () => {
  appConteneur.classList.add("menu-cache");
  boutonOuvrirMenu.hidden = false;
});
boutonOuvrirMenu.addEventListener("click", () => {
  appConteneur.classList.remove("menu-cache");
  boutonOuvrirMenu.hidden = true;
});
document.getElementById("fond-tiroir-mobile").addEventListener("click", () => {
  appConteneur.classList.add("menu-cache");
  boutonOuvrirMenu.hidden = false;
});

// sur mobile, le tiroir démarre fermé (sur desktop, il démarre ouvert)
if (window.innerWidth <= 720) {
  appConteneur.classList.add("menu-cache");
  boutonOuvrirMenu.hidden = false;
}

// ---------- bascule entre les modes : l'écran central change entièrement ----------
function masquerTousLesPanneaux() {
  filConversation.hidden = true;
  zoneImageActive.hidden = true;
  formulaire.hidden = true;
  ecranEtude.hidden = true;
  ecranConcours.hidden = true;
  ecranBibliotheque.hidden = true;
}

boutonsModes.forEach((bouton) => {
  bouton.addEventListener("click", () => {
    boutonsModes.forEach((b) => b.classList.remove("actif"));
    bouton.classList.add("actif");
    modeActif = bouton.dataset.mode;
    masquerTousLesPanneaux();

    if (modeActif === "chat") {
      filConversation.hidden = false;
      formulaire.hidden = false;
    } else if (modeActif === "etude") {
      ecranEtude.hidden = false;
    } else if (modeActif === "concours") {
      ecranConcours.hidden = false;
    } else if (modeActif === "bibliotheque") {
      ecranBibliotheque.hidden = false;
    }

    if (window.innerWidth <= 720) {
      appConteneur.classList.add("menu-cache");
      boutonOuvrirMenu.hidden = false;
    }
  });
});

// ---------- appel générique à l'IA pour un écran dédié (Étudier avec moi / Orientation) ----------
async function demanderALIA(prompt, conteneurResultat) {
  conteneurResultat.hidden = false;
  conteneurResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique, langue: selecteurLangue.value, structuree: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    conteneurResultat.innerHTML = construireReponseStructuree(data.reponse);
    rendreMaths(conteneurResultat);
    lireAudioAutomatique(texteLisibleDepuisReponse(data.reponse));
    historique.push({ role: "user", content: prompt });
    historique.push({ role: "assistant", content: data.reponse });
  } catch (erreur) {
    conteneurResultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

// ---------- Étudier avec moi : parcours proposés et leurs matières ----------
const MATIERES_PAR_PARCOURS = {
  "CEPE": ["Cours", "Examens", "Corrigés"],
  "BEPC": ["Maths", "Français", "SVT", "Histoire"],
  "BAC A": ["Philosophie", "Français", "Histoire", "Anglais"],
  "BAC C": ["Maths", "PC", "SVT"],
  "Université": ["Économie", "Statistique", "Informatique", "Droit"],
};

function remplirMatieresPourParcours() {
  const matieres = MATIERES_PAR_PARCOURS[etudeParcours.value] || [];
  etudeMatiere.innerHTML = matieres.map((m) => `<option value="${m}">${m}</option>`).join("");
}
etudeParcours.addEventListener("change", remplirMatieresPourParcours);
remplirMatieresPourParcours(); // remplissage initial au chargement de la page

// ============================================================
// ÉTUDIER AVEC MOI : séance guidée en 6 étapes (dans la session en cours)
// ============================================================
const etudeSession = document.getElementById("etude-session");
const etudeEtapesEl = document.getElementById("etude-etapes");
const etudeContenuEl = document.getElementById("etude-contenu");
const etudeBarreRemplie = document.getElementById("etude-barre-remplie");
const etudeProgressionTexte = document.getElementById("etude-progression-texte");

const ORDRE_ETAPES = ["cours", "exemple", "quiz", "exercices", "correction", "bilan"];
let etudeContexte = { parcours: "", matiere: "", sujet: "" };
let etudeEtapeActuelle = 0;
let etudeExercicesGeneres = []; // mémorisés pour l'étape Correction
let etudeCoursTexteBrut = ""; // mémorisé pour "Écouter le cours" et "Résumé"

function rendreMaths(conteneur) {
  if (window.renderMathInElement) {
    renderMathInElement(conteneur, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      throwOnError: false,
    });
  }
}

function mettreAJourPlan() {
  etudeEtapesEl.querySelectorAll("li").forEach((li, i) => {
    li.classList.remove("etape-active", "etape-faite");
    if (i < etudeEtapeActuelle) li.classList.add("etape-faite");
    if (i === etudeEtapeActuelle) li.classList.add("etape-active");
  });
  const pourcentage = Math.round((etudeEtapeActuelle / (ORDRE_ETAPES.length - 1)) * 100);
  etudeBarreRemplie.style.width = pourcentage + "%";
  etudeProgressionTexte.textContent = pourcentage + "%";
}

etudeEtapesEl.querySelectorAll("li").forEach((li, i) => {
  li.addEventListener("click", () => {
    etudeEtapeActuelle = i;
    chargerEtape(ORDRE_ETAPES[i]);
  });
});

formulaireEtude.addEventListener("submit", (e) => {
  e.preventDefault();
  const sujet = etudeSujet.value.trim();
  if (!sujet) return;

  etudeContexte = { parcours: etudeParcours.value, matiere: etudeMatiere.value, sujet };
  etudeEtapeActuelle = 0;
  etudeExercicesGeneres = [];
  etudeSession.hidden = false;
  mettreAJourPlan();
  chargerEtape("cours");
});

function libelleParcoursPourPrompt() {
  const { parcours, matiere } = etudeContexte;
  if (parcours === "CEPE") return `niveau CEPE (primaire, Burkina Faso), portant sur : ${matiere}`;
  return `niveau ${parcours}, matière ${matiere}`;
}

async function chargerEtape(etape, instructionSupplementaire) {
  etudeContenuEl.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const { sujet } = etudeContexte;
  const base = libelleParcoursPourPrompt();
  let prompt = "";

  if (etape === "cours") {
    prompt = `Fais un cours clair sur "${sujet}" (${base}). Structure : une définition précise, puis les points clés. ` +
      `Utilise du LaTeX entre symboles $ pour toute formule mathématique s'il y en a. Reste concis (une leçon, pas un livre). ` +
      (instructionSupplementaire || "");
  } else if (etape === "exemple") {
    prompt = `Donne un exemple concret entièrement résolu, étape par étape, sur "${sujet}" (${base}). Utilise du LaTeX entre $ pour les formules.`;
  } else if (etape === "exercices") {
    prompt = `Propose exactement 4 exercices d'entraînement sur "${sujet}" (${base}), de difficulté progressive. ` +
      `Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, au format : ` +
      `[{"titre": "...", "difficulte": "Facile|Moyen|Difficile", "enonce": "..."}]`;
  } else if (etape === "bilan") {
    prompt = `Fais un court bilan encourageant (3-4 phrases) pour clôturer une séance d'étude sur "${sujet}" (${base}), ` +
      `en rappelant le point clé à retenir.`;
  }

  try {
    if (etape === "exercices") {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
      etudeExercicesGeneres = extraireJSON(data.reponse);
      afficherExercices();
    } else if (etape === "quiz") {
      await afficherQuizEtude();
    } else if (etape === "correction") {
      afficherCorrections();
    } else {
      const structuree = etape === "cours" || etape === "exemple";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value, structuree }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
      if (etape === "cours") etudeCoursTexteBrut = data.reponse;
      afficherContenuEtape(etape, data.reponse, structuree);
    }
  } catch (erreur) {
    etudeContenuEl.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

function afficherContenuEtape(etape, texteReponse, structuree) {
  const libelles = { cours: "1. COURS", exemple: "2. EXEMPLE", bilan: "6. BILAN" };
  const html = structuree ? construireReponseStructuree(texteReponse) : construireReponseAvecAudio(texteReponse);
  etudeContenuEl.innerHTML = `
    <span class="etude-etiquette-etape">${libelles[etape] || ""}</span>
    <div>${html}</div>
    ${etape === "cours" ? `<button type="button" class="bouton-ecouter-cours" id="bouton-ecouter-cours">🔊 ${texteTraduit("etudeEcouterCours")}</button>` : ""}
    ${construireNavigationEtude()}
  `;
  rendreMaths(etudeContenuEl);

  const boutonEcouter = document.getElementById("bouton-ecouter-cours");
  if (boutonEcouter) {
    boutonEcouter.addEventListener("click", () => lireAudioAutomatique(texteLisibleDepuisReponse(etudeCoursTexteBrut)));
  }
  brancherNavigationEtude();
}

function construireNavigationEtude() {
  const precedentDesactive = etudeEtapeActuelle === 0 ? "disabled" : "";
  const estDerniere = etudeEtapeActuelle === ORDRE_ETAPES.length - 1;
  return `
    <div class="etude-navigation">
      <button type="button" class="bouton-etape-nav" id="etude-btn-precedent" ${precedentDesactive}>← ${texteTraduit("etudePrecedent")}</button>
      ${!estDerniere ? `<button type="button" class="bouton-etape-nav suivant" id="etude-btn-suivant">${texteTraduit("etudeSuivant")} →</button>` : ""}
    </div>
  `;
}

function brancherNavigationEtude() {
  const btnPrec = document.getElementById("etude-btn-precedent");
  const btnSuiv = document.getElementById("etude-btn-suivant");
  if (btnPrec) btnPrec.addEventListener("click", () => {
    if (etudeEtapeActuelle > 0) {
      etudeEtapeActuelle--;
      mettreAJourPlan();
      chargerEtape(ORDRE_ETAPES[etudeEtapeActuelle]);
    }
  });
  if (btnSuiv) btnSuiv.addEventListener("click", () => {
    if (etudeEtapeActuelle < ORDRE_ETAPES.length - 1) {
      etudeEtapeActuelle++;
      mettreAJourPlan();
      chargerEtape(ORDRE_ETAPES[etudeEtapeActuelle]);
    }
  });
}

function afficherExercices() {
  const html = `
    <span class="etude-etiquette-etape">4. EXERCICES</span>
    <p>${texteTraduit("etudeExercicesIntro")}</p>
    <div class="grille-exercices">
      ${etudeExercicesGeneres.map((ex, i) => `
        <div class="carte-exercice">
          <span class="titre-exercice">${echapperHtml(ex.titre)}</span>
          <span class="badge-difficulte ${ex.difficulte}">${ex.difficulte}</span>
          <p style="margin-top:8px; font-size:0.85rem;">${echapperHtml(ex.enonce)}</p>
        </div>
      `).join("")}
    </div>
    ${construireNavigationEtude()}
  `;
  etudeContenuEl.innerHTML = html;
  rendreMaths(etudeContenuEl);
  brancherNavigationEtude();
}

function afficherCorrections() {
  if (!etudeExercicesGeneres.length) {
    etudeContenuEl.innerHTML = `<p>${texteTraduit("etudePasExercices")}</p>${construireNavigationEtude()}`;
    brancherNavigationEtude();
    return;
  }
  const html = `
    <span class="etude-etiquette-etape">5. CORRECTION</span>
    <div class="grille-exercices" id="etude-grille-corrections" style="grid-template-columns: 1fr;">
      ${etudeExercicesGeneres.map((ex, i) => `
        <div class="carte-exercice" data-index="${i}">
          <span class="titre-exercice">${echapperHtml(ex.titre)} <span class="badge-difficulte ${ex.difficulte}">${ex.difficulte}</span></span>
          <p style="font-size:0.85rem;">${echapperHtml(ex.enonce)}</p>
          <button type="button" class="bouton-etape-nav bouton-voir-corrige" data-index="${i}">${texteTraduit("etudeVoirCorrige")}</button>
          <div class="etude-corrige-detail" id="corrige-${i}" hidden></div>
        </div>
      `).join("")}
    </div>
    ${construireNavigationEtude()}
  `;
  etudeContenuEl.innerHTML = html;
  rendreMaths(etudeContenuEl);
  brancherNavigationEtude();

  etudeContenuEl.querySelectorAll(".bouton-voir-corrige").forEach((bouton) => {
    bouton.addEventListener("click", async () => {
      const i = Number(bouton.dataset.index);
      const zone = document.getElementById(`corrige-${i}`);
      zone.hidden = false;
      zone.innerHTML = texteTraduit("reflexion");
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: `Donne la correction détaillée, étape par étape, de cet exercice : ${etudeExercicesGeneres[i].enonce}. Utilise du LaTeX entre $ pour les formules.`,
            historique: [],
            langue: selecteurLangue.value,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
        zone.innerHTML = construireReponseAvecAudio(data.reponse);
        rendreMaths(zone);
      } catch (erreur) {
        zone.innerHTML = `⚠️ ${echapperHtml(erreur.message)}`;
      }
    });
  });
}

async function afficherQuizEtude() {
  etudeContenuEl.innerHTML = `<span class="etude-etiquette-etape">3. QUIZ</span><p class="chargement-guide">${texteTraduit("jeuxPreparation")}</p>`;
  const { sujet } = etudeContexte;
  const prompt = `Génère exactement 3 questions à choix multiples pour vérifier la compréhension du sujet "${sujet}" (${libelleParcoursPourPrompt()}). ` +
    `Réponds UNIQUEMENT avec un tableau JSON valide au format : [{"question": "...", "choix": ["...", "...", "...", "..."], "reponse": 0}]`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    const questions = extraireJSON(data.reponse);

    let index = 0;
    let score = 0;
    const afficherQ = () => {
      const q = questions[index];
      etudeContenuEl.innerHTML = `
        <span class="etude-etiquette-etape">3. QUIZ (${index + 1}/${questions.length})</span>
        <div class="jeu-question">${echapperHtml(q.question)}</div>
        <div class="jeu-choix">
          ${q.choix.map((c, i) => `<button type="button" class="bouton-choix" data-index="${i}">${echapperHtml(c)}</button>`).join("")}
        </div>
      `;
      rendreMaths(etudeContenuEl);
      etudeContenuEl.querySelectorAll(".bouton-choix").forEach((bouton) => {
        bouton.addEventListener("click", () => {
          const choisi = Number(bouton.dataset.index);
          etudeContenuEl.querySelectorAll(".bouton-choix").forEach((b) => (b.disabled = true));
          if (choisi === Number(q.reponse)) {
            bouton.classList.add("bonne-reponse");
            score++;
          } else {
            bouton.classList.add("mauvaise-reponse");
            etudeContenuEl.querySelectorAll(".bouton-choix")[q.reponse].classList.add("bonne-reponse");
          }
          const boutonSuite = document.createElement("button");
          boutonSuite.type = "button";
          boutonSuite.className = "bouton-etape-nav suivant jeu-suivant";
          boutonSuite.textContent = index + 1 < questions.length ? texteTraduit("jeuxSuivant") : texteTraduit("etudeSuivant") + " →";
          boutonSuite.addEventListener("click", () => {
            index++;
            if (index < questions.length) {
              afficherQ();
            } else {
              etudeContenuEl.innerHTML = `<p>🎉 ${texteTraduit("jeuxScoreTexte").replace("{score}", score).replace("{total}", questions.length)}</p>${construireNavigationEtude()}`;
              brancherNavigationEtude();
            }
          });
          etudeContenuEl.appendChild(boutonSuite);
        });
      });
    };
    afficherQ();
  } catch (erreur) {
    etudeContenuEl.innerHTML = `<p>⚠️ ${texteTraduit("jeuxErreur")}</p>${construireNavigationEtude()}`;
    brancherNavigationEtude();
  }
}

// ---------- outils d'aide (colonne droite) ----------
document.querySelectorAll(".pastille-outil").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    const outil = bouton.dataset.outil;
    if (outil === "autrement") {
      chargerEtape("cours", "Explique cette fois-ci autrement, avec des mots plus simples qu'avant.");
    } else if (outil === "exemple") {
      chargerEtape("cours", "Inclus impérativement un exemple concret lié au contexte du Burkina Faso.");
    } else if (outil === "resume") {
      chargerEtape("cours", "Fais cette fois un résumé très condensé, en quelques lignes seulement, des points essentiels.");
    }
  });
});

// ---------- vérification de l'API au chargement ----------
async function verifierSante() {
  try {
    const res = await fetch("/api/sante");
    const data = await res.json();
    if (data.cle_api_configuree) {
      statutEl.classList.add("pret");
    } else {
      statutEl.classList.add("erreur");
      statutTexte.dataset.cleManquante = "1";
    }
  } catch {
    statutEl.classList.add("erreur");
    statutTexte.dataset.cleManquante = "0";
  }
  appliquerLangue();
}
verifierSante();

// ---------- affichage des messages ----------
function defilerVersLeBas() {
  filConversation.scrollTo({ top: filConversation.scrollHeight, behavior: "smooth" });
}

function ajouterMessage(role, contenuHtml) {
  const div = document.createElement("div");
  div.className = `message ${role === "user" ? "message-utilisateur" : "message-ia"}`;
  div.innerHTML = `<div class="bulle">${contenuHtml}</div>`;
  filConversation.appendChild(div);
  defilerVersLeBas();
  return div;
}

// fait apparaître les blocs d'une réponse l'un après l'autre (effet "streaming"
// façon Claude), sans jamais changer la hauteur de la page pendant l'animation —
// le contenu est déjà là, seule son opacité change, donc rien ne "saute"
function revelerProgressivement(divMessage) {
  const elements = divMessage.querySelectorAll(".bloc-structure, .ligne-reponse");
  elements.forEach((el, i) => {
    el.classList.add("bloc-en-attente");
    setTimeout(() => el.classList.add("bloc-revele"), 90 * i + 40);
  });
}

function ajouterChargement() {
  const div = document.createElement("div");
  div.className = "message message-ia";
  div.innerHTML = `<div class="bulle chargement">${texteTraduit("reflexion")}</div>`;
  filConversation.appendChild(div);
  defilerVersLeBas();
  return div;
}

function echapperHtml(texte) {
  const d = document.createElement("div");
  d.textContent = texte;
  return d.innerHTML;
}

// ---------- met en forme une réponse IA : un paragraphe par idée, gras, boutons audio ----------
// construit le HTML (paragraphes + boutons audio) d'un morceau de texte brut,
// réutilisé aussi bien par le rendu normal que par le rendu structuré
function blocTexteAvecAudio(texteBrut) {
  const langue = selecteurLangue.value;
  const lignes = texteBrut.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  let html = "";
  lignes.forEach((ligneBrute) => {
    const phrasesBrutes = ligneBrute.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [ligneBrute];
    let htmlLigne = "";
    phrasesBrutes.forEach((phraseBrute) => {
      const propre = phraseBrute.trim();
      if (!propre) return;
      const htmlPhrase = echapperHtml(propre).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      htmlLigne += htmlPhrase + " ";
      if (langue !== "moore") {
        const texteAudio = propre.replace(/\*\*/g, "");
        const index = bibliothequePhrases.length;
        bibliothequePhrases.push(texteAudio);
        htmlLigne += `<button type="button" class="btn-audio-phrase" data-index="${index}" title="🔊">🔊</button> `;
      }
    });
    html += `<p class="ligne-reponse">${htmlLigne.trim()}</p>`;
  });
  return html;
}

function construireReponseAvecAudio(texteReponse) {
  const langue = selecteurLangue.value;
  let html = blocTexteAvecAudio(texteReponse);
  if (langue === "moore") {
    html += `<span class="note-audio-indisponible">${texteTraduit("audioIndisponibleMoore")}</span>`;
  }
  return html;
}

// tente de lire la réponse structurée en JSON ; si le modèle n'a pas
// respecté le format, on retombe simplement sur le rendu normal
// construit une liste <ul>/<ol> avec un bouton audio par élément
function listeAvecAudio(items, tag) {
  const langue = selecteurLangue.value;
  const html = items.map((item) => {
    const htmlPhrase = echapperHtml(item).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    let bouton = "";
    if (langue !== "moore") {
      const index = bibliothequePhrases.length;
      bibliothequePhrases.push(item);
      bouton = ` <button type="button" class="btn-audio-phrase" data-index="${index}" title="🔊">🔊</button>`;
    }
    return `<li>${htmlPhrase}${bouton}</li>`;
  }).join("");
  return `<${tag}>${html}</${tag}>`;
}

// trace un graphique SVG propre à partir de points de données chiffrées
// (jamais d'IA générant du SVG à main levée : trop peu fiable — ici l'IA ne
// fournit que des nombres, et c'est nous qui traçons)
function construireGraphiqueSVG(graphique) {
  const points = graphique.points;
  if (!Array.isArray(points) || points.length < 2) return "";

  const largeur = 480, hauteur = 220, marge = 38;
  const valeursX = points.map((p, i) => (typeof p.x === "number" ? p.x : i));
  const valeursY = points.map((p) => Number(p.y) || 0);
  const xMin = Math.min(...valeursX), xMax = Math.max(...valeursX);
  const yMin = Math.min(0, ...valeursY), yMax = Math.max(...valeursY) || 1;

  const echelleX = (x) => marge + ((x - xMin) / ((xMax - xMin) || 1)) * (largeur - 2 * marge);
  const echelleY = (y) => hauteur - marge - ((y - yMin) / ((yMax - yMin) || 1)) * (hauteur - 2 * marge);

  let trace = "";
  if (graphique.type === "barres") {
    const largeurBarre = ((largeur - 2 * marge) / points.length) * 0.55;
    trace = points.map((p, i) => {
      const cx = echelleX(valeursX[i]);
      const y = echelleY(valeursY[i]);
      return `<rect x="${cx - largeurBarre / 2}" y="${y}" width="${largeurBarre}" height="${hauteur - marge - y}" fill="#8b6fd8" rx="3"/>`;
    }).join("");
  } else {
    const chemin = points.map((p, i) => `${echelleX(valeursX[i])},${echelleY(valeursY[i])}`).join(" ");
    trace = `<polyline points="${chemin}" fill="none" stroke="#8b6fd8" stroke-width="2.5"/>` +
      points.map((p, i) => `<circle cx="${echelleX(valeursX[i])}" cy="${echelleY(valeursY[i])}" r="3.5" fill="#e8b75c"/>`).join("");
  }

  const axes = `<line x1="${marge}" y1="${hauteur - marge}" x2="${largeur - marge}" y2="${hauteur - marge}" stroke="rgba(242,239,226,0.3)"/>` +
    `<line x1="${marge}" y1="${marge}" x2="${marge}" y2="${hauteur - marge}" stroke="rgba(242,239,226,0.3)"/>`;
  const labelsX = points.map((p, i) =>
    `<text x="${echelleX(valeursX[i])}" y="${hauteur - marge + 16}" font-size="9" fill="#8a9a8f" text-anchor="middle">${echapperHtml(String(p.x))}</text>`
  ).join("");

  return `
    <div class="bloc-graphique">
      ${graphique.titre ? `<p class="graphique-titre">${echapperHtml(graphique.titre)}</p>` : ""}
      <svg viewBox="0 0 ${largeur} ${hauteur}" class="graphique-svg">${axes}${trace}${labelsX}</svg>
    </div>
  `;
}

// construit les blocs additionnels selon la matière détectée par l'IA
// (uniquement ceux réellement présents dans la réponse)
// mémorise le contenu de chaque anticipation, pour l'ouvrir/fermer sans le
// répéter dans le HTML (comme bibliothequePhrases pour l'audio)
let bibliothequeAnticipations = [];

function construireAnticipations(anticipations) {
  if (!Array.isArray(anticipations) || anticipations.length === 0) return "";

  const boutons = anticipations.map((a) => {
    const index = bibliothequeAnticipations.length;
    bibliothequeAnticipations.push(a.contenu || "");
    return `
      <div class="anticipation" data-index="${index}">
        <button type="button" class="anticipation-titre">
          <span>${echapperHtml(a.titre || "")}</span>
          <span class="anticipation-chevron">▾</span>
        </button>
        <div class="anticipation-contenu" hidden></div>
      </div>`;
  }).join("");

  return `
    <div class="bloc-anticipations">
      <p class="anticipations-intro">${texteTraduit("anticipationsIntro")}</p>
      ${boutons}
    </div>`;
}

// clic délégué : ouvre/ferme une anticipation, en générant son contenu
// (avec audio + maths) seulement la première fois qu'on l'ouvre
document.body.addEventListener("click", (e) => {
  const titreBouton = e.target.closest(".anticipation-titre");
  if (!titreBouton) return;

  const bloc = titreBouton.closest(".anticipation");
  const contenuEl = bloc.querySelector(".anticipation-contenu");
  const dejaOuvert = !contenuEl.hidden;

  // ferme toute autre anticipation ouverte dans le même message (comportement accordéon)
  bloc.parentElement.querySelectorAll(".anticipation").forEach((autre) => {
    autre.classList.remove("anticipation-ouverte");
    autre.querySelector(".anticipation-contenu").hidden = true;
  });

  if (dejaOuvert) return; // le clic vient de tout refermer, on s'arrête là

  if (!contenuEl.dataset.rempli) {
    const texteBrut = bibliothequeAnticipations[Number(bloc.dataset.index)];
    contenuEl.innerHTML = blocTexteAvecAudio(texteBrut);
    rendreMaths(contenuEl);
    contenuEl.dataset.rempli = "1";
  }
  contenuEl.hidden = false;
  bloc.classList.add("anticipation-ouverte");
});

function construireBlocsOptionnels(donnees) {
  let html = "";

  if (Array.isArray(donnees.chronologie) && donnees.chronologie.length) {
    html += `
      <div class="bloc-structure bloc-optionnel">
        <div class="bloc-structure-entete entete-violette">📅 Chronologie</div>
        <div class="bloc-structure-corps">
          <ul class="liste-chronologie">
            ${donnees.chronologie.map((e) => `<li><strong>${echapperHtml(e.date || "")}</strong> — ${echapperHtml(e.evenement || "")}</li>`).join("")}
          </ul>
        </div>
      </div>`;
  }

  if (donnees.langue_info) {
    const li = donnees.langue_info;
    html += `
      <div class="bloc-structure bloc-optionnel">
        <div class="bloc-structure-entete entete-violette">🌍 Langue</div>
        <div class="bloc-structure-corps">
          ${li.traduction ? `<p><strong>Traduction :</strong> ${echapperHtml(li.traduction)}</p>` : ""}
          ${li.prononciation ? `<p><strong>Prononciation :</strong> ${echapperHtml(li.prononciation)}</p>` : ""}
          ${li.pieges ? `<p><strong>⚠️ Piège fréquent :</strong> ${echapperHtml(li.pieges)}</p>` : ""}
        </div>
      </div>`;
  }

  if (donnees.graphique) {
    html += `
      <div class="bloc-structure bloc-optionnel">
        <div class="bloc-structure-entete entete-violette">📊 Graphique</div>
        <div class="bloc-structure-corps">${construireGraphiqueSVG(donnees.graphique)}</div>
      </div>`;
  }

  if (donnees.exemple_burkina) {
    html += `
      <div class="bloc-structure bloc-optionnel">
        <div class="bloc-structure-entete entete-violette">🇧🇫 Exemple au Burkina Faso</div>
        <div class="bloc-structure-corps">${blocTexteAvecAudio(donnees.exemple_burkina)}</div>
      </div>`;
  }

  return html;
}

function construireReponseStructuree(texteReponse) {
  let donnees;
  try {
    donnees = extraireJSONObjet(texteReponse);
    const explicationsValides = Array.isArray(donnees.explications) ? donnees.explications.length > 0 : !!donnees.explications;
    if (!donnees.definition || !explicationsValides || !Array.isArray(donnees.exemples) || donnees.exemples.length < 2) {
      throw new Error("format incomplet");
    }
  } catch {
    return construireReponseAvecAudio(texteReponse); // repli si format non respecté
  }

  const langue = selecteurLangue.value;
  const htmlExplications = Array.isArray(donnees.explications)
    ? listeAvecAudio(donnees.explications, "ul")
    : blocTexteAvecAudio(donnees.explications);

  return `
    <div class="reponse-structuree">
      <div class="reponse-structuree-rangee">
        <div class="bloc-structure bloc-definition">
          <div class="bloc-structure-entete">Définition</div>
          <div class="bloc-structure-corps">${blocTexteAvecAudio(donnees.definition)}</div>
        </div>
        <div class="bloc-structure bloc-explications">
          <div class="bloc-structure-entete">Explications</div>
          <div class="bloc-structure-corps">${htmlExplications}</div>
        </div>
      </div>
      <div class="bloc-structure bloc-exemples">
        <div class="bloc-structure-entete">${donnees.exemples.length > 1 ? "Exemples" : "Exemple"}</div>
        <div class="bloc-structure-corps">${listeAvecAudio(donnees.exemples, "ol")}</div>
      </div>
      ${construireBlocsOptionnels(donnees)}
      ${construireAnticipations(donnees.anticipations)}
      ${langue === "moore" ? `<span class="note-audio-indisponible">${texteTraduit("audioIndisponibleMoore")}</span>` : ""}
    </div>
  `;
}

// ---------- lecture audio : une seule source à la fois, arrêtable ----------
function jouerAudio(blob) {
  if (audioActuel) {
    audioActuel.pause();
    audioActuel = null;
  }
  audioActuel = new Audio(URL.createObjectURL(blob));
  boutonStopAudio.hidden = false;
  audioActuel.onended = () => {
    boutonStopAudio.hidden = true;
    audioActuel = null;
  };
  audioActuel.play();
}

boutonStopAudio.addEventListener("click", () => {
  if (audioActuel) {
    audioActuel.pause();
    audioActuel = null;
  }
  boutonStopAudio.hidden = true;
});

// lit automatiquement toute la réponse dès qu'elle arrive (fr/en uniquement,
// le mooré n'a pas de voix disponible via gTTS)
async function lireAudioAutomatique(texteReponse) {
  if (selecteurLangue.value === "moore") return;
  try {
    const res = await fetch("/api/parler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texte: texteReponse, langue: selecteurLangue.value }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    jouerAudio(blob);
  } catch {
    // audio best-effort : en cas d'échec, le texte reste affiché normalement
  }
}

// écoute déléguée : clic sur un bouton audio de phrase, dans le fil OU les écrans dédiés
document.body.addEventListener("click", async (e) => {
  const bouton = e.target.closest(".btn-audio-phrase");
  if (!bouton) return;

  const texte = bibliothequePhrases[Number(bouton.dataset.index)];
  if (!texte) return;

  bouton.disabled = true;
  try {
    const res = await fetch("/api/parler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texte, langue: selecteurLangue.value }),
    });
    if (!res.ok) throw new Error("audio indisponible");
    const blob = await res.blob();
    jouerAudio(blob);
  } catch {
    bouton.textContent = "🔇";
    setTimeout(() => { bouton.textContent = "🔊"; }, 1500);
  } finally {
    bouton.disabled = false;
  }
});

// ---------- gestion de l'image jointe (mode Discussion) ----------
entreeFichier.addEventListener("change", () => {
  const fichier = entreeFichier.files[0];
  if (!fichier) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    imageSelectionnee = { fichier, dataUrl: lecteur.result };
    apercuImage.src = lecteur.result;
    zoneImageActive.hidden = false;
  };
  lecteur.readAsDataURL(fichier);
});

retirerImageBtn.addEventListener("click", () => {
  imageSelectionnee = null;
  entreeFichier.value = "";
  zoneImageActive.hidden = true;
});

// ---------- détection d'intention : l'utilisateur veut-il une image générée ? ----------
// Heuristique par mots-clés (pas une vraie compréhension d'intention) : couvre les
// formulations les plus courantes en français/anglais pour demander une image.
const MOTIFS_GENERATION_IMAGE = [
  /g[ée]n[èe]re?(-moi|z)?\s+(une\s+)?(image|photo|illustration|dessin)/i,
  /cr[ée]e?(-moi|z)?\s+(une\s+)?(image|photo|illustration|dessin)/i,
  /dessine(-moi)?\s+/i,
  /fais?(-moi)?\s+(une\s+)?(image|photo|illustration|dessin)/i,
  /peux[- ]tu\s+(me\s+)?(dessiner|g[ée]n[ée]rer|cr[ée]er)\s+(une\s+)?(image|photo)/i,
  /generate\s+(an?\s+)?(image|photo|picture|illustration)/i,
  /create\s+(an?\s+)?(image|photo|picture|illustration)/i,
  /draw\s+(me\s+)?(an?\s+)?/i,
];

function estDemandeGenerationImage(texte) {
  return MOTIFS_GENERATION_IMAGE.some((motif) => motif.test(texte));
}

// ---------- point d'entrée unique : décide quoi faire du message de l'utilisateur ----------
async function traiterMessageUtilisateur(texte) {
  if (imageSelectionnee) {
    await envoyerImage(texte);
  } else if (texte && estDemandeGenerationImage(texte)) {
    await genererEtAfficherImage(texte);
  } else {
    await envoyerTexte(texte);
  }
}

async function genererEtAfficherImage(prompt) {
  ajouterMessage("user", `🎨 ${echapperHtml(prompt)}`);
  entreeTexte.value = "";
  const bulleChargement = ajouterChargement();
  bulleChargement.querySelector(".bulle").textContent = texteTraduit("generationEnCours");

  try {
    const res = await fetch("/api/generer-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    bulleChargement.remove();

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || texteTraduit("erreurInconnue"));
    }

    const blobImage = await res.blob();
    const urlImage = URL.createObjectURL(blobImage);
    ajouterMessage("assistant", `<img src="${urlImage}" alt="${echapperHtml(prompt)}">`);
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

// ---------- envoi du formulaire (texte et/ou image) ----------
formulaire.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texte = entreeTexte.value.trim();
  if (!texte && !imageSelectionnee) return;
  await traiterMessageUtilisateur(texte);
});

function horodatageHtml() {
  const maintenant = new Date();
  const heures = String(maintenant.getHours()).padStart(2, "0");
  const minutes = String(maintenant.getMinutes()).padStart(2, "0");
  return `<span class="horodatage-message">${heures}:${minutes}</span>`;
}

// extrait un texte lisible (sans accolades JSON) à partir d'une réponse
// structurée, pour la lecture audio et le téléchargement
function texteLisibleDepuisReponse(texteReponseBrut) {
  try {
    const d = extraireJSONObjet(texteReponseBrut);
    if (d.definition) {
      const exp = Array.isArray(d.explications) ? d.explications.join(". ") : d.explications;
      const ex = Array.isArray(d.exemples) ? d.exemples.join(". ") : "";
      return `${d.definition}. ${exp}. ${ex}`;
    }
  } catch {
    // pas du JSON structuré : le texte brut est déjà lisible tel quel
  }
  return texteReponseBrut;
}

function texteTelechargeableDepuisReponse(texteReponseBrut) {
  try {
    const d = extraireJSONObjet(texteReponseBrut);
    if (d.definition) {
      const exp = Array.isArray(d.explications) ? d.explications.map((e) => `- ${e}`).join("\n") : d.explications;
      const ex = Array.isArray(d.exemples) ? d.exemples.map((e, i) => `${i + 1}. ${e}`).join("\n") : "";
      return `DÉFINITION\n${d.definition}\n\nEXPLICATIONS\n${exp}\n\nEXEMPLES\n${ex}`;
    }
  } catch {
    // repli ci-dessous
  }
  return texteReponseBrut;
}

// ajoute la rangée de boutons d'action (👍 👎 📄 🔄 🎧 ⬇️) sous une réponse
// du chat principal, chacun déclenchant une action réelle
function ajouterActionsMessage(divMessage, texteReponseBrut) {
  const conteneur = document.createElement("div");
  conteneur.className = "actions-message";
  conteneur.innerHTML = `
    <button type="button" class="btn-action-msg" data-action="clair">👍 C'est clair</button>
    <button type="button" class="btn-action-msg" data-action="pascompris">👎 Pas compris</button>
    <button type="button" class="btn-action-msg" data-action="resumer">📝 Résumer</button>
    <button type="button" class="btn-action-msg" data-action="autreexemple">📚 Autre exemple</button>
    <button type="button" class="btn-action-msg" data-action="creerexercice">🎓 Créer un exercice</button>
    <button type="button" class="btn-action-msg" data-action="corrigerexercice">✅ Corriger mon exercice</button>
    <button type="button" class="btn-action-msg" data-action="interroge">❓ Interroge-moi</button>
    <button type="button" class="btn-action-msg" data-action="burkina">🌍 Exemple Burkina Faso</button>
    <button type="button" class="btn-action-msg" data-action="ecouter">🔊 Lire à voix haute</button>
    <button type="button" class="btn-action-msg" data-action="telecharger">📥 Télécharger en PDF</button>
  `;
  divMessage.querySelector(".bulle").appendChild(conteneur);

  conteneur.querySelectorAll(".btn-action-msg").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const action = bouton.dataset.action;
      if (action === "clair") {
        bouton.textContent = "✅ Merci !";
        bouton.disabled = true;
      } else if (action === "pascompris") {
        envoyerTexte("Je n'ai pas compris ta réponse précédente : explique-moi autrement, avec des mots plus simples.");
      } else if (action === "resumer") {
        envoyerTexte("Fais un résumé très court (2-3 phrases) de ta réponse précédente.");
      } else if (action === "autreexemple") {
        envoyerTexte("Donne-moi un autre exemple, différent, sur le même sujet que ta réponse précédente.");
      } else if (action === "creerexercice") {
        envoyerTexte("Crée un exercice sur le même sujet que ta réponse précédente. Attends ma réponse avant de corriger.");
      } else if (action === "corrigerexercice") {
        entreeTexte.value = "Corrige cet exercice : ";
        entreeTexte.focus();
      } else if (action === "interroge") {
        envoyerTexte("Interroge-moi avec une question sur le même sujet que ta réponse précédente, pour vérifier ma compréhension.");
      } else if (action === "burkina") {
        envoyerTexte("Donne-moi un exemple concret lié au Burkina Faso sur le même sujet que ta réponse précédente.");
      } else if (action === "ecouter") {
        lireAudioAutomatique(texteLisibleDepuisReponse(texteReponseBrut));
      } else if (action === "telecharger") {
        telechargerReponsePDF(texteReponseBrut);
      }
    });
  });
}

function telechargerReponsePDF(texteReponseBrut) {
  if (!window.jspdf) {
    // repli si jsPDF n'a pas pu se charger (ex : pas de réseau) : fichier texte
    const blob = new Blob([texteTelechargeableDepuisReponse(texteReponseBrut)], { type: "text/plain;charset=utf-8" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "reponse-inous-ai.txt";
    lien.click();
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const texte = texteTelechargeableDepuisReponse(texteReponseBrut);
  const largeurUtile = 180;

  doc.setFontSize(16);
  doc.text("INOUS.AI", 15, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleDateString("fr-FR"), 15, 24);
  doc.setTextColor(20);
  doc.setFontSize(11);

  const lignes = doc.splitTextToSize(texte, largeurUtile);
  doc.text(lignes, 15, 36);
  doc.save("reponse-inous-ai.pdf");
}

async function envoyerTexte(texte, texteAffiche) {
  ajouterMessage("user", echapperHtml(texteAffiche || texte) + horodatageHtml());
  entreeTexte.value = "";
  const bulleChargement = ajouterChargement();

  // ---------- mode hors ligne : IA locale, pas de serveur ----------
  if (!navigator.onLine) {
    if (!modeleHorsLigneDejaPret()) {
      bulleChargement.remove();
      ajouterMessage("assistant", "🔌 Pas de connexion, et le mode hors ligne n'a pas encore été préparé. Reconnecte-toi une fois pour le télécharger (bouton dans le panneau de gauche).");
      return;
    }
    try {
      const reponseLocale = await repondreHorsLigne(texte, historique);
      bulleChargement.remove();
      const divReponse = ajouterMessage("assistant", construireReponseAvecAudio(reponseLocale));
      revelerProgressivement(divReponse);
      lireAudioHorsLigne(reponseLocale);
      historique.push({ role: "user", content: texte });
      historique.push({ role: "assistant", content: reponseLocale });
    } catch (erreur) {
      bulleChargement.remove();
      ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
    }
    return;
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: texte, historique, langue: selecteurLangue.value, structuree: true, statut: selecteurStatut.value }),
    });
    const data = await res.json();
    bulleChargement.remove();

    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    const divReponse = ajouterMessage("assistant", construireReponseStructuree(data.reponse));
    revelerProgressivement(divReponse);
    rendreMaths(divReponse);
    ajouterActionsMessage(divReponse, data.reponse);
    lireAudioAutomatique(texteLisibleDepuisReponse(data.reponse));
    historique.push({ role: "user", content: texte });
    historique.push({ role: "assistant", content: data.reponse });
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

async function envoyerImage(question) {
  const questionEffective = question || texteTraduit("descriptionParDefaut");
  ajouterMessage(
    "user",
    `${echapperHtml(questionEffective)}<img src="${imageSelectionnee.dataUrl}">`
  );
  entreeTexte.value = "";
  const fichierEnvoye = imageSelectionnee.fichier;
  imageSelectionnee = null;
  entreeFichier.value = "";
  zoneImageActive.hidden = true;

  const bulleChargement = ajouterChargement();

  try {
    const formData = new FormData();
    formData.append("fichier", fichierEnvoye);

    const res = await fetch(`/api/analyser-image?question=${encodeURIComponent(questionEffective)}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    bulleChargement.remove();

    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    ajouterMessage("assistant", construireReponseAvecAudio(data.reponse));
    lireAudioAutomatique(data.reponse);
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

// ============================================================
// ENREGISTREMENT VOCAL RÉUTILISABLE
// ============================================================
// Un seul mécanisme d'enregistrement, utilisé à deux endroits différents :
// le micro du chat (mode Discussion/Voix) et le micro de la génération
// d'image. `surTranscription` reçoit le texte transcrit une fois prêt.
function creerBoutonMicro(bouton, surTranscription) {
  let enregistreur = null;
  let chunksAudio = [];
  let enEcoute = false;

  bouton.addEventListener("click", async () => {
    if (enEcoute) {
      enregistreur.stop();
      return;
    }

    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
      enregistreur = new MediaRecorder(flux);
      chunksAudio = [];

      enregistreur.ondataavailable = (e) => chunksAudio.push(e.data);
      enregistreur.onstop = async () => {
        enEcoute = false;
        bouton.classList.remove("actif");
        flux.getTracks().forEach((piste) => piste.stop());

        const blobAudio = new Blob(chunksAudio, { type: "audio/webm" });
        await transcrireEtTraiter(blobAudio, surTranscription);
      };

      enregistreur.start();
      enEcoute = true;
      bouton.classList.add("actif");
    } catch {
      ajouterMessage("assistant", texteTraduit("micIndisponible"));
    }
  });
}

async function transcrireEtTraiter(blobAudio, surTranscription) {
  const bulleChargement = ajouterChargement();
  bulleChargement.querySelector(".bulle").textContent = texteTraduit("transcriptionEnCours");

  try {
    const formData = new FormData();
    formData.append("fichier", blobAudio, "audio.webm");
    const resTranscription = await fetch("/api/transcrire", { method: "POST", body: formData });
    const dataTranscription = await resTranscription.json();
    bulleChargement.remove();
    if (!resTranscription.ok) throw new Error(dataTranscription.detail || texteTraduit("erreurInconnue"));

    await surTranscription(dataTranscription.texte);
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

// Micro du chat : transcrit puis passe par le même point d'entrée que le texte
// (donc "génère une image de..." parlé au micro fonctionne aussi)
creerBoutonMicro(boutonMicro, async (texteUtilisateur) => {
  await traiterMessageUtilisateur(texteUtilisateur);
});

// ============================================================
// Utilitaires JSON réutilisés par Étudier avec moi (quiz, exercices) et le
// chat principal (réponses structurées)
// ============================================================
function extraireJSON(texteBrut) {
  const nettoye = texteBrut.replace(/```json|```/g, "").trim();
  const debut = nettoye.indexOf("[");
  const fin = nettoye.lastIndexOf("]");
  if (debut === -1 || fin === -1) throw new Error("format inattendu");
  return JSON.parse(nettoye.slice(debut, fin + 1));
}

// même principe, mais pour un objet JSON { ... } au lieu d'un tableau [ ... ]
function extraireJSONObjet(texteBrut) {
  const nettoye = texteBrut.replace(/```json|```/g, "").trim();
  const debut = nettoye.indexOf("{");
  const fin = nettoye.lastIndexOf("}");
  if (debut === -1 || fin === -1) throw new Error("format inattendu");
  return JSON.parse(nettoye.slice(debut, fin + 1));
}

// ============================================================
// PRÉPA CONCOURS
// ============================================================
// Données stables uniquement (niveau, organisme, catégorie) — volontairement
// SANS dates précises : inventer une date d'examen serait risqué (un élève
// pourrait s'y fier et rater la vraie échéance officielle).
const LISTE_CONCOURS = [
  { nom: "CEPE", organisme: "Certificat d'Études Primaires", icone: "🎓", niveau: "CM2", niveauAcces: "BEPC", frequence: "Annuel", categorie: "Éducation" },
  { nom: "BEPC", organisme: "Brevet d'Études du Premier Cycle", icone: "📘", niveau: "3e", niveauAcces: "BEPC", frequence: "Annuel", categorie: "Éducation" },
  { nom: "BAC", organisme: "Baccalauréat (séries A1, A2, C, D, E)", icone: "🎓", niveau: "Terminale", niveauAcces: "BAC", frequence: "Annuel", categorie: "Éducation" },
  { nom: "ENAREF", organisme: "École Nationale des Régies Financières", icone: "🏛️", niveau: "Post-BAC", niveauAcces: "BAC", frequence: "Annuel", categorie: "Finances" },
  { nom: "ENAM", organisme: "École Nationale d'Administration et de Magistrature", icone: "⚖️", niveau: "Licence", niveauAcces: "Licence", frequence: "Annuel", categorie: "Administration" },
  { nom: "ENS", organisme: "École Normale Supérieure", icone: "📗", niveau: "BAC", niveauAcces: "BAC", frequence: "Annuel", categorie: "Éducation" },
  { nom: "POLICE", organisme: "Concours Direct Police", icone: "👮", niveau: "BAC", niveauAcces: "BAC", frequence: "Annuel", categorie: "Sécurité" },
  { nom: "GENDARMERIE", organisme: "Recrutement Gendarmerie", icone: "🎖️", niveau: "BAC", niveauAcces: "BAC", frequence: "Annuel", categorie: "Sécurité" },
  { nom: "DOUANES", organisme: "Concours Direct Douanes", icone: "🛃", niveau: "BAC", niveauAcces: "BAC", frequence: "Annuel", categorie: "Finances" },
  { nom: "TRÉSOR", organisme: "Concours Trésor Public", icone: "💰", niveau: "BAC+2/3", niveauAcces: "Licence", frequence: "Irrégulier", categorie: "Finances" },
  { nom: "MAGISTRATURE", organisme: "Concours Magistrature", icone: "⚖️", niveau: "BAC+4", niveauAcces: "Master", frequence: "Irrégulier", categorie: "Justice" },
  { nom: "FONCTION PUBLIQUE", organisme: "Recrutement Fonction Publique", icone: "🏢", niveau: "Divers", niveauAcces: "Professionnels", frequence: "Variable", categorie: "Administration" },
];

const NIVEAUX_ACCES = [
  { id: "BEPC", icone: "📘", titre: "Niveau BEPC", description: "Concours accessibles après la classe de 3e" },
  { id: "BAC", icone: "📙", titre: "Niveau BAC", description: "Concours accessibles après le Baccalauréat" },
  { id: "Licence", icone: "🎓", titre: "Niveau Licence", description: "Concours accessibles après une Licence" },
  { id: "Master", icone: "🎓", titre: "Niveau Master", description: "Concours accessibles après un Master" },
  { id: "Professionnels", icone: "👨‍💼", titre: "Professionnels", description: "Concours internes et professionnels" },
];

const CONSEILS_DU_JOUR = [
  "La régularité bat l'intensité : 30 minutes chaque jour valent mieux qu'une nuit blanche avant l'examen.",
  "Refais les mêmes exercices plusieurs fois — la répétition espacée est ce qui ancre vraiment une notion.",
  "Explique à voix haute ce que tu viens d'apprendre, comme si tu l'enseignais à quelqu'un — ça révèle vite ce qui n'est pas encore clair.",
  "Une bonne nuit de sommeil avant un concours vaut souvent plus qu'une heure de révision supplémentaire.",
  "Note tes erreurs dans un carnet à part — elles sont souvent la meilleure source de révision.",
];

const grilleConcours = document.getElementById("grille-concours");
const concoursRecherche = document.getElementById("concours-recherche");
const concoursFiltres = document.getElementById("concours-filtres");
const concoursConseilTexte = document.getElementById("concours-conseil-texte");
const concoursResultat = document.getElementById("concours-resultat");
const grilleNiveaux = document.getElementById("grille-niveaux");
const concoursVueNiveau = document.getElementById("concours-vue-niveau");
const concoursNiveauChoisiTexte = document.getElementById("concours-niveau-choisi-texte");

let categorieActive = "Tous";
let niveauActif = null;

function rendreGrilleNiveaux() {
  grilleNiveaux.innerHTML = NIVEAUX_ACCES.map((n) => {
    const nombre = LISTE_CONCOURS.filter((c) => c.niveauAcces === n.id).length;
    return `
      <button type="button" class="carte-niveau" data-niveau="${n.id}">
        <span class="niveau-icone">${n.icone}</span>
        <span class="niveau-titre">${n.titre}</span>
        <span class="niveau-desc">${n.description}</span>
        <span class="niveau-compte">${nombre} concours disponible${nombre > 1 ? "s" : ""}</span>
      </button>`;
  }).join("");

  grilleNiveaux.querySelectorAll(".carte-niveau").forEach((carte) => {
    carte.addEventListener("click", () => choisirNiveau(carte.dataset.niveau));
  });
}
rendreGrilleNiveaux();

function choisirNiveau(idNiveau) {
  niveauActif = idNiveau;
  const infos = NIVEAUX_ACCES.find((n) => n.id === idNiveau);
  concoursNiveauChoisiTexte.textContent = `Niveau choisi : ${infos.titre.replace("Niveau ", "")} — ${infos.description}`;
  concoursVueNiveau.hidden = true;
  concoursVueListe.hidden = false;
  categorieActive = "Tous";
  concoursFiltres.querySelectorAll(".filtre-concours").forEach((b) => b.classList.toggle("actif", b.dataset.categorie === "Tous"));
  concoursRecherche.value = "";
  rendreConcours();
}

document.getElementById("btn-changer-niveau").addEventListener("click", () => {
  concoursVueListe.hidden = true;
  concoursVueNiveau.hidden = false;
  niveauActif = null;
});

function rendreConcours() {
  const recherche = concoursRecherche.value.trim().toLowerCase();
  const filtres = LISTE_CONCOURS.filter((c) => {
    const correspondNiveau = !niveauActif || c.niveauAcces === niveauActif;
    const correspondCategorie = categorieActive === "Tous" || c.categorie === categorieActive;
    const correspondRecherche = !recherche || c.nom.toLowerCase().includes(recherche) || c.organisme.toLowerCase().includes(recherche);
    return correspondNiveau && correspondCategorie && correspondRecherche;
  });

  grilleConcours.innerHTML = filtres.map((c) => `
    <div class="carte-concours">
      <div class="carte-concours-entete">
        <div class="carte-concours-icone">${c.icone}</div>
        <div>
          <div class="carte-concours-nom">${c.nom}</div>
          <div class="carte-concours-organisme">${c.organisme}</div>
        </div>
      </div>
      <span class="badge-categorie">${c.categorie}</span>
      <div class="carte-concours-infos">
        📊 Niveau : ${c.niveau}<br>
        🔁 Fréquence : ${c.frequence}
      </div>
      <button type="button" class="bouton-se-preparer" data-nom="${c.nom}">Se préparer →</button>
    </div>
  `).join("") || `<p class="chargement-guide">Aucun concours ne correspond à ta recherche.</p>`;

  grilleConcours.querySelectorAll(".bouton-se-preparer").forEach((bouton) => {
    bouton.addEventListener("click", () => ouvrirPageConcours(bouton.dataset.nom));
  });
}

concoursRecherche.addEventListener("input", rendreConcours);
concoursFiltres.querySelectorAll(".filtre-concours").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    concoursFiltres.querySelectorAll(".filtre-concours").forEach((b) => b.classList.remove("actif"));
    bouton.classList.add("actif");
    categorieActive = bouton.dataset.categorie;
    rendreConcours();
  });
});

// ---------- assistant de recommandation : décrire sa situation, l'IA filtre ----------
document.getElementById("btn-recommander").addEventListener("click", async () => {
  const situation = document.getElementById("recommandation-texte").value.trim();
  const zoneResultat = document.getElementById("recommandation-resultat");
  if (!situation) return;

  zoneResultat.hidden = false;
  zoneResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const listeTexte = LISTE_CONCOURS.map((c) => `${c.nom} (niveau requis : ${c.niveau}, catégorie : ${c.categorie})`).join(" ; ");
  const prompt = `Voici la situation d'un utilisateur : "${situation}". ` +
    `Voici la liste des concours disponibles sur cette plateforme : ${listeTexte}. ` +
    `Recommande-lui, parmi UNIQUEMENT cette liste, les concours réellement accessibles ou pertinents pour sa situation, et explique pourquoi. ` +
    `Si aucun de la liste ne correspond bien, dis-le honnêtement. Précise que ce sont des niveaux indicatifs à vérifier officiellement.`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value, structuree: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    zoneResultat.innerHTML = construireReponseStructuree(data.reponse);
    rendreMaths(zoneResultat);
    lireAudioAutomatique(texteLisibleDepuisReponse(data.reponse));
  } catch (erreur) {
    zoneResultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
});

const concoursVueListe = document.getElementById("concours-vue-liste");
const concoursVueDetail = document.getElementById("concours-vue-detail");
const concoursResultatDetail = document.getElementById("concours-resultat-detail");
const grilleDocumentsConcours = document.getElementById("grille-documents-concours");
const btnPartagerPourConcours = document.getElementById("btn-partager-pour-concours");
const formulairePartageConcours = document.getElementById("formulaire-partage-concours");
const partageConcoursNom = document.getElementById("partage-concours-nom");
const partageConcoursCategorie = document.getElementById("partage-concours-categorie");
const partageConcoursFichier = document.getElementById("partage-concours-fichier");
const btnValiderPartageConcours = document.getElementById("btn-valider-partage-concours");

let concoursActuel = null;

async function ouvrirPageConcours(nomConcours) {
  const infos = LISTE_CONCOURS.find((c) => c.nom === nomConcours);
  concoursActuel = nomConcours;

  concoursVueListe.hidden = true;
  concoursVueDetail.hidden = false;
  document.getElementById("detail-concours-icone").textContent = infos.icone;
  document.getElementById("detail-concours-nom").textContent = infos.nom;
  document.getElementById("detail-concours-organisme").textContent = infos.organisme;
  formulairePartageConcours.hidden = true;

  await genererPreparationConcours(nomConcours);
  await chargerDocumentsPourConcours(nomConcours);
}

document.getElementById("btn-retour-concours").addEventListener("click", () => {
  concoursVueDetail.hidden = true;
  concoursVueListe.hidden = false;
  concoursActuel = null;
});

async function chargerDocumentsPourConcours(nomConcours) {
  grilleDocumentsConcours.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetch(`/api/bibliotheque/documents?concours=${encodeURIComponent(nomConcours)}`);
    const documents = await res.json();
    if (!res.ok) throw new Error(documents.detail || texteTraduit("erreurInconnue"));

    if (!documents.length) {
      grilleDocumentsConcours.innerHTML = `<p class="chargement-guide">Aucun document partagé pour ce concours pour l'instant — sois le premier !</p>`;
      return;
    }
    grilleDocumentsConcours.innerHTML = documents.map((doc) => `
      <div class="carte-document">
        <span class="badge-origine ${doc.origine}">${LIBELLES_ORIGINE[doc.origine] || doc.origine}</span>
        <span class="doc-nom">${echapperHtml(doc.nom)}</span>
        <span class="doc-meta">${echapperHtml(doc.categorie)} · ${formaterTaille(doc.taille_octets)}</span>
        <div class="doc-actions">
          <a href="${doc.url_fichier}" target="_blank" rel="noopener">📖 Lire</a>
          <a href="${doc.url_fichier}" download="${echapperHtml(doc.nom)}">⬇️ Télécharger</a>
        </div>
      </div>
    `).join("");
  } catch (erreur) {
    grilleDocumentsConcours.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

btnPartagerPourConcours.addEventListener("click", () => {
  if (!localStorage.getItem("inous_jeton")) {
    alert("Connecte-toi d'abord pour partager un document.");
    return;
  }
  formulairePartageConcours.hidden = !formulairePartageConcours.hidden;
});

btnValiderPartageConcours.addEventListener("click", async () => {
  const nom = partageConcoursNom.value.trim();
  const categorie = partageConcoursCategorie.value;
  const fichier = partageConcoursFichier.files[0];
  const jeton = localStorage.getItem("inous_jeton");

  if (!nom || !fichier) {
    alert("Ajoute un titre et un fichier avant d'envoyer.");
    return;
  }
  btnValiderPartageConcours.disabled = true;
  btnValiderPartageConcours.textContent = "Envoi en cours…";

  try {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("nom", nom);
    formData.append("categorie", categorie);
    formData.append("concours", concoursActuel);

    const res = await fetch("/api/bibliotheque/partager", {
      method: "POST",
      headers: { Authorization: `Bearer ${jeton}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    partageConcoursNom.value = "";
    partageConcoursFichier.value = "";
    formulairePartageConcours.hidden = true;
    chargerDocumentsPourConcours(concoursActuel);
  } catch (erreur) {
    alert("Erreur : " + erreur.message);
  } finally {
    btnValiderPartageConcours.disabled = false;
    btnValiderPartageConcours.textContent = "Envoyer";
  }
});

async function genererPreparationConcours(nomConcours) {
  concoursResultatDetail.hidden = false;
  concoursResultatDetail.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const infos = LISTE_CONCOURS.find((c) => c.nom === nomConcours);
  const prompt = `Prépare un guide de préparation général pour le concours "${nomConcours}" (${infos.organisme}, niveau ${infos.niveau}, Burkina Faso) : ` +
    `les grandes étapes/épreuves habituelles, les matières généralement testées, et des conseils concrets de préparation. ` +
    `Dans "exemples", donne un exemple de type de question posée à ce genre de concours. ` +
    `Précise bien que ce sont des informations générales et indicatives — l'utilisateur doit vérifier le programme officiel exact auprès de l'organisme concerné.`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value, structuree: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    concoursResultatDetail.innerHTML = construireReponseStructuree(data.reponse);
    rendreMaths(concoursResultatDetail);
    lireAudioAutomatique(texteLisibleDepuisReponse(data.reponse));
  } catch (erreur) {
    concoursResultatDetail.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

// ---------- accès rapide ----------
document.querySelectorAll(".acces-rapide-btn").forEach((bouton) => {
  bouton.addEventListener("click", async () => {
    const outil = bouton.dataset.outil;
    if (outil === "annales") {
      concoursResultat.hidden = false;
      concoursResultat.innerHTML = `<p>📚 Les vraies annales officielles (sujets et corrigés des années précédentes) ne sont pas encore disponibles dans l'appli — ce serait risqué de proposer de faux sujets. Cette fonctionnalité arrivera quand de vraies archives officielles pourront être intégrées.</p>`;
      return;
    }
    concoursResultat.hidden = false;
    concoursResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

    const structuree = outil === "fiches";
    const prompt = outil === "fiches"
      ? "Fais une fiche de révision synthétique (points clés, formules ou dates essentielles) sur un sujet fréquemment demandé aux concours administratifs et scolaires au Burkina Faso : la méthodologie de dissertation."
      : "Génère 3 questions de culture générale/méthodologie typiques d'un QCM de concours administratif au Burkina Faso, avec les réponses expliquées. Structure avec un retour à la ligne entre chaque idée.";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value, structuree }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
      concoursResultat.innerHTML = structuree ? construireReponseStructuree(data.reponse) : construireReponseAvecAudio(data.reponse);
      rendreMaths(concoursResultat);
      lireAudioAutomatique(texteLisibleDepuisReponse(data.reponse));
    } catch (erreur) {
      concoursResultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
    }
  });
});

// initialisation : conseil du jour aléatoire + première grille
concoursConseilTexte.textContent = CONSEILS_DU_JOUR[Math.floor(Math.random() * CONSEILS_DU_JOUR.length)];
rendreConcours();

// ============================================================
// BIBLIOTHÈQUE : importer un PDF et discuter avec son contenu
// ============================================================
// Rien n'est envoyé sur un serveur de stockage : le texte extrait reste en
// mémoire dans le navigateur, pour cette session uniquement.
const biblioFichier = document.getElementById("biblio-fichier");
const biblioStatutDoc = document.getElementById("biblio-statut-doc");
const grilleActionsBiblio = document.getElementById("grille-actions-biblio");
const biblioQuestionLibre = document.getElementById("biblio-question-libre");
const biblioQuestionTexte = document.getElementById("biblio-question-texte");
const biblioPoserQuestion = document.getElementById("biblio-poser-question");
const biblioResultat = document.getElementById("biblio-resultat");

let documentImporte = null; // { nom, texte, tronque }

biblioFichier.addEventListener("change", async () => {
  const fichier = biblioFichier.files[0];
  if (!fichier) return;

  biblioStatutDoc.textContent = "⏳ Import en cours…";

  try {
    const formData = new FormData();
    formData.append("fichier", fichier);
    const res = await fetch("/api/importer-pdf", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    documentImporte = { nom: data.nom, texte: data.texte, tronque: data.tronque };
    biblioStatutDoc.textContent = `✅ ${data.nom} importé` + (data.tronque ? " (document long, seule la première partie est prise en compte)" : "");
  } catch (erreur) {
    biblioStatutDoc.textContent = `⚠️ ${erreur.message}`;
    documentImporte = null;
  }
});

async function interrogerDocument(consigne) {
  if (!documentImporte) {
    biblioResultat.hidden = false;
    biblioResultat.innerHTML = `<p>${texteTraduit("biblioPasDeDocument")}</p>`;
    return;
  }

  biblioResultat.hidden = false;
  biblioResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const prompt = `Voici le contenu d'un document (peut être partiel) :\n\n"""${documentImporte.texte}"""\n\n${consigne}`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value, structuree: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    biblioResultat.innerHTML = construireReponseStructuree(data.reponse);
    rendreMaths(biblioResultat);
    lireAudioAutomatique(texteLisibleDepuisReponse(data.reponse));
  } catch (erreur) {
    biblioResultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

grilleActionsBiblio.querySelectorAll(".carte-action-biblio").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    const action = bouton.dataset.action;
    if (action === "question") {
      biblioQuestionLibre.hidden = false;
      biblioQuestionTexte.focus();
      return;
    }
    biblioQuestionLibre.hidden = true;

    const consignes = {
      resumer: "Fais un résumé clair et structuré de ce document, avec un retour à la ligne entre chaque idée.",
      quiz: "Génère 4 questions à choix multiples pour vérifier la compréhension de ce document. Réponds UNIQUEMENT avec un tableau JSON valide : [{\"question\": \"...\", \"choix\": [\"...\",\"...\",\"...\",\"...\"], \"reponse\": 0}]",
      fiche: "Fais une fiche de révision synthétique (points clés) à partir de ce document, avec un retour à la ligne entre chaque idée.",
    };

    if (action === "quiz") {
      genererQuizDocument();
    } else {
      interrogerDocument(consignes[action]);
    }
  });
});

biblioPoserQuestion.addEventListener("click", () => {
  const question = biblioQuestionTexte.value.trim();
  if (!question) return;
  biblioQuestionTexte.value = "";
  interrogerDocument(`Réponds à cette question précise à partir du document : ${question}`);
});

async function genererQuizDocument() {
  if (!documentImporte) {
    biblioResultat.hidden = false;
    biblioResultat.innerHTML = `<p>${texteTraduit("biblioPasDeDocument")}</p>`;
    return;
  }
  biblioResultat.hidden = false;
  biblioResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("jeuxPreparation")}</p>`;

  const prompt = `Voici le contenu d'un document (peut être partiel) :\n\n"""${documentImporte.texte}"""\n\n` +
    `Génère exactement 4 questions à choix multiples pour vérifier la compréhension de ce document. ` +
    `Réponds UNIQUEMENT avec un tableau JSON valide : [{"question": "...", "choix": ["...","...","...","..."], "reponse": 0}]`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    const questions = extraireJSON(data.reponse);

    let index = 0, score = 0;
    const afficherQ = () => {
      const q = questions[index];
      biblioResultat.innerHTML = `
        <div class="jeu-progression">${index + 1} / ${questions.length}</div>
        <div class="jeu-question">${echapperHtml(q.question)}</div>
        <div class="jeu-choix">${q.choix.map((c, i) => `<button type="button" class="bouton-choix" data-index="${i}">${echapperHtml(c)}</button>`).join("")}</div>
      `;
      biblioResultat.querySelectorAll(".bouton-choix").forEach((bouton) => {
        bouton.addEventListener("click", () => {
          const choisi = Number(bouton.dataset.index);
          biblioResultat.querySelectorAll(".bouton-choix").forEach((b) => (b.disabled = true));
          if (choisi === Number(q.reponse)) { bouton.classList.add("bonne-reponse"); score++; }
          else {
            bouton.classList.add("mauvaise-reponse");
            biblioResultat.querySelectorAll(".bouton-choix")[q.reponse].classList.add("bonne-reponse");
          }
          const suite = document.createElement("button");
          suite.type = "button";
          suite.className = "bouton-envoyer jeu-suivant";
          suite.textContent = index + 1 < questions.length ? texteTraduit("jeuxSuivant") : texteTraduit("jeuxTermine");
          suite.addEventListener("click", () => {
            index++;
            if (index < questions.length) afficherQ();
            else biblioResultat.innerHTML = `<p>🎉 ${texteTraduit("jeuxScoreTexte").replace("{score}", score).replace("{total}", questions.length)}</p>`;
          });
          biblioResultat.appendChild(suite);
        });
      });
    };
    afficherQ();
  } catch {
    biblioResultat.innerHTML = `<p>⚠️ ${texteTraduit("jeuxErreur")}</p>`;
  }
}

// ============================================================
// BIBLIOTHÈQUE PARTAGÉE : documents réels, stockés côté serveur (Supabase),
// visibles par tout le monde. Upload réservé aux utilisateurs connectés.
// ============================================================
const grilleDocuments = document.getElementById("grille-documents");
const filtreDocuments = document.getElementById("biblio-filtre-categorie");
const btnPartagerDocument = document.getElementById("btn-partager-document");
const formulairePartage = document.getElementById("biblio-partage-formulaire");
const partageNom = document.getElementById("partage-nom");
const partageCategorie = document.getElementById("partage-categorie");
const partageFichier = document.getElementById("partage-fichier");
const btnValiderPartage = document.getElementById("btn-valider-partage");

const LIBELLES_ORIGINE = { utilisateur: "Partagé par un membre", domaine_public: "Domaine public" };

function formaterTaille(octets) {
  if (!octets) return "";
  if (octets < 1024 * 1024) return Math.round(octets / 1024) + " Ko";
  return (octets / (1024 * 1024)).toFixed(1) + " Mo";
}

async function chargerDocumentsPartages() {
  grilleDocuments.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetch(`/api/bibliotheque/documents?categorie=${encodeURIComponent(filtreDocuments.value)}`);
    const documents = await res.json();
    if (!res.ok) throw new Error(documents.detail || texteTraduit("erreurInconnue"));

    if (!documents.length) {
      grilleDocuments.innerHTML = `<p class="chargement-guide">Aucun document pour l'instant — sois le premier à en partager un !</p>`;
      return;
    }

    grilleDocuments.innerHTML = documents.map((doc) => `
      <div class="carte-document">
        <span class="badge-origine ${doc.origine}">${LIBELLES_ORIGINE[doc.origine] || doc.origine}</span>
        <span class="doc-nom">${echapperHtml(doc.nom)}</span>
        <span class="doc-meta">${echapperHtml(doc.categorie)} · ${formaterTaille(doc.taille_octets)}</span>
        <div class="doc-actions">
          <a href="${doc.url_fichier}" target="_blank" rel="noopener">📖 Lire</a>
          <a href="${doc.url_fichier}" download="${echapperHtml(doc.nom)}">⬇️ Télécharger</a>
        </div>
      </div>
    `).join("");
  } catch (erreur) {
    grilleDocuments.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

filtreDocuments.addEventListener("change", chargerDocumentsPartages);

btnPartagerDocument.addEventListener("click", () => {
  if (!localStorage.getItem("inous_jeton")) {
    grilleDocuments.insertAdjacentHTML("beforebegin", `<p class="note-avertissement">⚠️ Connecte-toi d'abord pour partager un document.</p>`);
    return;
  }
  formulairePartage.hidden = !formulairePartage.hidden;
});

btnValiderPartage.addEventListener("click", async () => {
  const nom = partageNom.value.trim();
  const categorie = partageCategorie.value;
  const fichier = partageFichier.files[0];
  const jeton = localStorage.getItem("inous_jeton");

  if (!nom || !fichier) {
    alert("Ajoute un titre et un fichier avant d'envoyer.");
    return;
  }
  btnValiderPartage.disabled = true;
  btnValiderPartage.textContent = "Envoi en cours…";

  try {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("nom", nom);
    formData.append("categorie", categorie);

    const res = await fetch("/api/bibliotheque/partager", {
      method: "POST",
      headers: { Authorization: `Bearer ${jeton}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    partageNom.value = "";
    partageFichier.value = "";
    formulairePartage.hidden = true;
    chargerDocumentsPartages();
  } catch (erreur) {
    alert("Erreur : " + erreur.message);
  } finally {
    btnValiderPartage.disabled = false;
    btnValiderPartage.textContent = "Envoyer";
  }
});

chargerDocumentsPartages();

// ============================================================
// COMPTE UTILISATEUR (connexion / inscription réelles via Supabase)
// ============================================================
const blocCompteDeconnecte = document.getElementById("compte-deconnecte");
const blocCompteConnecte = document.getElementById("compte-connecte");
const compteEmailEl = document.getElementById("compte-email");
const compteProgresEl = document.getElementById("compte-progres");
const fondModaleCompte = document.getElementById("fond-modale-compte");
const titreModaleCompte = document.getElementById("titre-modale-compte");
const champEmail = document.getElementById("compte-champ-email");
const champMdp = document.getElementById("compte-champ-mdp");
const boutonValiderCompte = document.getElementById("compte-bouton-valider");
const compteMessage = document.getElementById("compte-message");
const compteBascule = document.getElementById("compte-bascule");

let modeModaleCompte = "connexion"; // ou "inscription"

function ouvrirModaleCompte(mode) {
  modeModaleCompte = mode;
  titreModaleCompte.textContent = mode === "connexion" ? "Se connecter" : "Créer un compte";
  boutonValiderCompte.textContent = mode === "connexion" ? "Se connecter" : "Créer mon compte";
  compteBascule.textContent = mode === "connexion" ? "Pas de compte ? Crée-en un" : "Déjà un compte ? Connecte-toi";
  compteMessage.textContent = "";
  champEmail.value = "";
  champMdp.value = "";
  fondModaleCompte.hidden = false;
}

document.getElementById("btn-ouvrir-connexion").addEventListener("click", () => ouvrirModaleCompte("connexion"));
document.getElementById("fermer-modale-compte").addEventListener("click", () => { fondModaleCompte.hidden = true; });
compteBascule.addEventListener("click", () => ouvrirModaleCompte(modeModaleCompte === "connexion" ? "inscription" : "connexion"));

boutonValiderCompte.addEventListener("click", async () => {
  const email = champEmail.value.trim();
  const motDePasse = champMdp.value;
  if (!email || motDePasse.length < 6) {
    compteMessage.textContent = "Email valide et mot de passe de 6 caractères minimum requis.";
    return;
  }

  const route = modeModaleCompte === "connexion" ? "/api/auth/connexion" : "/api/auth/inscription";
  compteMessage.textContent = "…";
  try {
    const res = await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mot_de_passe: motDePasse }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Une erreur est survenue.");

    if (data.confirmation_requise) {
      compteMessage.style.color = "var(--accent)";
      compteMessage.textContent = "Compte créé — vérifie ta boîte mail pour confirmer avant de te connecter.";
      return;
    }

    localStorage.setItem("inous_jeton", data.jeton);
    localStorage.setItem("inous_email", data.email);
    fondModaleCompte.hidden = true;
    await appliquerEtatConnexion();
  } catch (erreur) {
    compteMessage.style.color = "var(--erreur)";
    compteMessage.textContent = erreur.message;
  }
});

document.getElementById("btn-deconnexion").addEventListener("click", () => {
  localStorage.removeItem("inous_jeton");
  localStorage.removeItem("inous_email");
  appliquerEtatConnexion();
});

async function appliquerEtatConnexion() {
  const jeton = localStorage.getItem("inous_jeton");
  const email = localStorage.getItem("inous_email");

  if (!jeton) {
    blocCompteDeconnecte.hidden = false;
    blocCompteConnecte.hidden = true;
    return;
  }

  blocCompteDeconnecte.hidden = true;
  blocCompteConnecte.hidden = false;
  compteEmailEl.textContent = email;

  try {
    const res = await fetch("/api/profil", { headers: { Authorization: `Bearer ${jeton}` } });
    if (!res.ok) throw new Error();
    const profil = await res.json();
    compteProgresEl.textContent = `🔥 ${profil.serie_actuelle} · ⭐ ${profil.points}`;
  } catch {
    compteProgresEl.textContent = "";
  }
}
appliquerEtatConnexion();

// ============================================================
// MODE HORS LIGNE : petite IA locale dans le navigateur (WebLLM),
// zéro serveur impliqué une fois téléchargée. Fonctionne uniquement si le
// téléphone/ordinateur supporte WebGPU — sinon, message clair plutôt qu'un
// plantage silencieux.
// ============================================================
const MODELE_HORS_LIGNE = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"; // ~400 Mo, le plus léger disponible

let moteurHorsLigne = null;
let webllmModule = null;

const btnPreparerHorsLigne = document.getElementById("btn-preparer-hors-ligne");
const horsLigneBarre = document.getElementById("hors-ligne-barre");
const horsLigneBarreRemplie = document.getElementById("hors-ligne-barre-remplie");
const horsLigneStatut = document.getElementById("hors-ligne-statut");
const bandeauHorsLigne = document.getElementById("bandeau-hors-ligne");

function modeleHorsLigneDejaPret() {
  return localStorage.getItem("inous_hors_ligne_pret") === "1";
}

if (modeleHorsLigneDejaPret()) {
  horsLigneStatut.textContent = "✅ Prêt à être utilisé hors connexion.";
  btnPreparerHorsLigne.textContent = "🔁 Re-télécharger le modèle";
}

btnPreparerHorsLigne.addEventListener("click", async () => {
  if (!navigator.onLine) {
    horsLigneStatut.textContent = "⚠️ Connecte-toi à internet au moins une fois pour préparer le mode hors ligne.";
    return;
  }
  btnPreparerHorsLigne.disabled = true;
  horsLigneBarre.hidden = false;
  horsLigneStatut.textContent = "Vérification de la compatibilité…";

  try {
    if (!navigator.gpu) {
      throw new Error("Cet appareil/navigateur ne supporte pas WebGPU — le mode hors ligne n'est pas disponible ici.");
    }

    horsLigneStatut.textContent = "Téléchargement du modèle (environ 400 Mo)…";
    if (!webllmModule) {
      webllmModule = await import("https://esm.run/@mlc-ai/web-llm");
    }

    moteurHorsLigne = await webllmModule.CreateMLCEngine(MODELE_HORS_LIGNE, {
      initProgressCallback: (rapport) => {
        const pourcentage = Math.round((rapport.progress || 0) * 100);
        horsLigneBarreRemplie.style.width = pourcentage + "%";
        horsLigneStatut.textContent = `Téléchargement… ${pourcentage}%`;
      },
    });

    localStorage.setItem("inous_hors_ligne_pret", "1");
    horsLigneStatut.textContent = "✅ Prêt ! Tu peux maintenant utiliser le chat sans connexion.";
    btnPreparerHorsLigne.textContent = "🔁 Re-télécharger le modèle";
  } catch (erreur) {
    horsLigneStatut.textContent = `⚠️ ${erreur.message}`;
    localStorage.removeItem("inous_hors_ligne_pret");
  } finally {
    btnPreparerHorsLigne.disabled = false;
  }
});

// charge le moteur en mémoire si besoin (au cas où la page vient d'être
// rechargée hors ligne, après une préparation faite lors d'une session précédente)
async function garantirMoteurHorsLigneCharge() {
  if (moteurHorsLigne) return moteurHorsLigne;
  if (!webllmModule) {
    webllmModule = await import("https://esm.run/@mlc-ai/web-llm");
  }
  moteurHorsLigne = await webllmModule.CreateMLCEngine(MODELE_HORS_LIGNE);
  return moteurHorsLigne;
}

async function repondreHorsLigne(question, historiqueRecent) {
  const moteur = await garantirMoteurHorsLigneCharge();
  const messages = [
    {
      role: "system",
      content: "Tu es INOUS.AI, un assistant éducatif. Réponds simplement, clairement et brièvement, en français, sans mise en forme spéciale (pas de JSON, pas de balises).",
    },
    ...historiqueRecent.slice(-6), // contexte réduit : petit modèle, mémoire limitée
    { role: "user", content: question },
  ];
  const reponse = await moteur.chat.completions.create({ messages });
  return reponse.choices[0].message.content;
}

// synthèse vocale hors ligne : l'API du navigateur (aucun serveur nécessaire)
function lireAudioHorsLigne(texte) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const enonce = new SpeechSynthesisUtterance(texte);
  enonce.lang = selecteurLangue.value === "en" ? "en-US" : "fr-FR";
  window.speechSynthesis.speak(enonce);
}

function mettreAJourBandeauConnexion() {
  bandeauHorsLigne.hidden = navigator.onLine;
}
window.addEventListener("online", mettreAJourBandeauConnexion);
window.addEventListener("offline", mettreAJourBandeauConnexion);
mettreAJourBandeauConnexion();

// ---------- mot de passe oublié (par code, pas par lien) ----------
const fondModaleReinit = document.getElementById("fond-modale-reinit");
const reinitEtapeEmail = document.getElementById("reinit-etape-email");
const reinitEtapeCode = document.getElementById("reinit-etape-code");
const reinitChampEmail = document.getElementById("reinit-champ-email");
const reinitBoutonEnvoyer = document.getElementById("reinit-bouton-envoyer");
const reinitMessage = document.getElementById("reinit-message");
const reinitChampCode = document.getElementById("reinit-champ-code");
const reinitChampNouveauMdp = document.getElementById("reinit-champ-nouveau-mdp");
const reinitBoutonValiderCode = document.getElementById("reinit-bouton-valider-code");
const reinitCodeMessage = document.getElementById("reinit-code-message");

let emailEnAttenteDeCode = "";

document.getElementById("compte-mdp-oublie").addEventListener("click", () => {
  fondModaleCompte.hidden = true;
  reinitEtapeEmail.hidden = false;
  reinitEtapeCode.hidden = true;
  reinitChampEmail.value = "";
  reinitMessage.textContent = "";
  fondModaleReinit.hidden = false;
});
document.getElementById("fermer-modale-reinit").addEventListener("click", () => { fondModaleReinit.hidden = true; });

async function envoyerCodeReinitialisation() {
  const email = reinitChampEmail.value.trim();
  if (!email) {
    reinitMessage.textContent = "Entre ton email d'abord.";
    return;
  }
  reinitMessage.style.color = "var(--muet)";
  reinitMessage.textContent = "Envoi en cours…";
  try {
    const res = await fetch("/api/auth/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, url_retour: window.location.origin + "/" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erreur lors de l'envoi.");

    emailEnAttenteDeCode = email;
    reinitEtapeEmail.hidden = true;
    reinitEtapeCode.hidden = false;
    reinitChampCode.value = "";
    reinitChampNouveauMdp.value = "";
    reinitCodeMessage.textContent = "";
  } catch (erreur) {
    reinitMessage.style.color = "var(--erreur)";
    reinitMessage.textContent = erreur.message;
  }
}
reinitBoutonEnvoyer.addEventListener("click", envoyerCodeReinitialisation);

document.getElementById("reinit-renvoyer-code").addEventListener("click", () => {
  reinitEtapeCode.hidden = true;
  reinitEtapeEmail.hidden = false;
  reinitChampEmail.value = emailEnAttenteDeCode;
});

reinitBoutonValiderCode.addEventListener("click", async () => {
  const code = reinitChampCode.value.trim();
  const nouveauMdp = reinitChampNouveauMdp.value;

  if (!code || nouveauMdp.length < 6) {
    reinitCodeMessage.style.color = "var(--erreur)";
    reinitCodeMessage.textContent = "Entre le code reçu et un mot de passe de 6 caractères minimum.";
    return;
  }
  reinitCodeMessage.style.color = "var(--muet)";
  reinitCodeMessage.textContent = "Vérification…";

  try {
    const res = await fetch("/api/auth/verifier-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailEnAttenteDeCode, code, nouveau_mot_de_passe: nouveauMdp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erreur.");

    reinitCodeMessage.style.color = "var(--accent)";
    reinitCodeMessage.textContent = "✅ Mot de passe changé — tu peux te connecter.";
    setTimeout(() => {
      fondModaleReinit.hidden = true;
      ouvrirModaleCompte("connexion");
    }, 1500);
  } catch (erreur) {
    reinitCodeMessage.style.color = "var(--erreur)";
    reinitCodeMessage.textContent = erreur.message;
  }
});

// ---------- définir un nouveau mot de passe (arrivée depuis le lien email) ----------
function analyserJetonsRecuperation() {
  const fragment = new URLSearchParams(window.location.hash.replace("#", ""));
  if (fragment.get("type") !== "recovery") return null;
  const access_token = fragment.get("access_token");
  const refresh_token = fragment.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

const jetonsRecuperation = analyserJetonsRecuperation();
if (jetonsRecuperation) {
  document.getElementById("fond-modale-nouveau-mdp").hidden = false;
  history.replaceState(null, "", window.location.pathname); // nettoie l'URL

  document.getElementById("nouveau-mdp-bouton").addEventListener("click", async () => {
    const nouveauMdp = document.getElementById("nouveau-mdp-champ").value;
    const messageEl = document.getElementById("nouveau-mdp-message");
    if (nouveauMdp.length < 6) {
      messageEl.textContent = "6 caractères minimum.";
      return;
    }
    messageEl.style.color = "var(--muet)";
    messageEl.textContent = "…";
    try {
      const res = await fetch("/api/auth/nouveau-mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...jetonsRecuperation, nouveau_mot_de_passe: nouveauMdp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur.");
      messageEl.style.color = "var(--accent)";
      messageEl.textContent = "✅ Mot de passe changé — tu peux te connecter.";
      setTimeout(() => {
        document.getElementById("fond-modale-nouveau-mdp").hidden = true;
        ouvrirModaleCompte("connexion");
      }, 1500);
    } catch (erreur) {
      messageEl.style.color = "var(--erreur)";
      messageEl.textContent = erreur.message;
    }
  });
}

// ---------- effacer la session ----------
btnEffacer.addEventListener("click", () => {
  historique = [];
  bibliothequePhrases = [];
  bibliothequeAnticipations = [];
  filConversation.innerHTML = "";
  ajouterMessage("assistant", texteTraduit("sessionEffacee"));
});
