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
const etudeEtapeNiveau = document.getElementById("etude-etape-niveau");
const etudeEtapeTechnique = document.getElementById("etude-etape-technique");
const etudeEtapeClasse = document.getElementById("etude-etape-classe");
const grilleNiveauxEtude = document.getElementById("grille-niveaux-etude");
const grilleTechniques = document.getElementById("grille-techniques");
const etudeNiveauChoisiTitre = document.getElementById("etude-niveau-choisi-titre");
const etudeSujetFormulaire = document.getElementById("etude-sujet-formulaire");
const etudeMatiereV2 = document.getElementById("etude-matiere-v2");
const etudeSujetV2 = document.getElementById("etude-sujet-v2");
const ecranEtude = document.getElementById("ecran-etude");
const ecranConcours = document.getElementById("ecran-concours");
const ecranBibliotheque = document.getElementById("ecran-bibliotheque");
const ecranProfil = document.getElementById("ecran-profil");
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
    sousTitre: "L'intelligence artificielle pour améliorer ton apprentissage",
    modeChat: "Assistant IA",
    modeEtude: "Étudier avec moi",
    modeProfil: "Mon profil",
    modeOrientation: "Orientation",
    modeImage: "Analyser une image",
    modeGeneration: "Générer une image",
    labelLangue: "Langue de conversation",
    btnEffacer: "Effacer la session",
    statutVerification: "Vérification…",
    statutConnecte: "Connecté",
    statutCleManquante: "Clé API manquante (.env)",
    statutInjoignable: "Backend injoignable",
    messageAccueil: 'Bonjour, je suis <strong>INO-Education</strong>. Choisis un mode à gauche : discute avec moi, lance une séance d\'étude guidée, explore une orientation, ou analyse/génère une image.',
    titreJoindre: "Joindre une image",
    titreParler: "Parler",
    titreParlerImage: "Décrire à la voix",
    placeholderTexte: "Écris ta question ici…",
    placeholderImage: "Décris l'image que tu veux générer…",
    btnEnvoyer: "Envoyer",
    btnGenerer: "🎨 Générer",
    reflexion: "INO-Education réfléchit…",
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
    etudeDesc: "Choisis ton niveau et ta matière, décris le sujet — INO-Education construit une séance complète : explication, exemple, questions et exercices.",
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
    orientationDesc: "Décris ta situation, INO-Education te propose un parcours indicatif : filières, compétences, débouchés.",
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
    concoursTitre: "Préparation concours",
    concoursAccesRapide: "Accès rapide",
    concoursAnnales: "Sujets & Annales",
    concoursConseilsTitre: "Conseil du jour",
    concoursFiches: "Fiches de révision",
    concoursPopulaires: "Concours nationaux",
    concoursQcm: "QCM d'entraînement",
    etapeBilanDesc: "Fin de séance",
    etapeCorrectionDesc: "Voir les corrigés",
    etapeCoursDesc: "Comprendre la leçon",
    etapeExempleDesc: "Voir un cas résolu",
    etapeExercicesDesc: "S'entraîner",
    etapeQuizDesc: "Vérifier ta compréhension",
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
    modeProfil: "My profile",
    modeOrientation: "Career guidance",
    modeImage: "Analyze an image",
    modeGeneration: "Generate an image",
    labelLangue: "Conversation language",
    btnEffacer: "Clear session",
    statutVerification: "Checking…",
    statutConnecte: "Connected",
    statutCleManquante: "Missing API key (.env)",
    statutInjoignable: "Backend unreachable",
    messageAccueil: 'Hello, I\'m <strong>INO-Education</strong>. Pick a mode on the left: chat with me, start a guided study session, explore career guidance, or analyze/generate an image.',
    titreJoindre: "Attach an image",
    titreParler: "Speak",
    titreParlerImage: "Describe with your voice",
    placeholderTexte: "Type your question here…",
    placeholderImage: "Describe the image you want to generate…",
    btnEnvoyer: "Send",
    btnGenerer: "🎨 Generate",
    reflexion: "INO-Education is thinking…",
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
    etudeDesc: "Pick your level and subject, describe the topic — INO-Education builds a full session: explanation, example, questions and exercises.",
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
    orientationDesc: "Describe your situation, INO-Education suggests an indicative path: fields, skills, career prospects.",
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
    modeProfil: "Mam sõore",
    modeOrientation: "Sore-tũub",
    modeImage: "Fo foto ges-gu",
    modeGeneration: "Foto naaneg",
    labelLangue: "Goam sẽn na n tũ",
    btnEffacer: "Yiisi gomd-kãngã",
    statutVerification: "D gũusda…",
    statutConnecte: "Yaa vẽeneg",
    statutCleManquante: "Zĩmb-koɛɛg ka be ye (.env)",
    statutInjoignable: "D ka tõe n paas serveur ye",
    messageAccueil: 'Ne y windiga, mam yaa <strong>INO-Education</strong>. Yãk zãmsg sẽn be goabga: gom ne mam, sɩng zãmsg sõng, bãng sore-tũub, wall ges/naan foto.',
    titreJoindre: "Paas foto",
    titreParler: "Gom",
    titreParlerImage: "Wilg ne koɛɛg",
    placeholderTexte: "Gʋls f sokre ka…",
    placeholderImage: "Wilg foto ning fo sẽn dat…",
    btnEnvoyer: "Tʋm",
    btnGenerer: "🎨 Naan",
    reflexion: "INO-Education yaa tags…",
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
    etudeDesc: "Yãk f karengã la f zãmsgã, wilg-y sẽn dat n zãms — INO-Education na naan zãmsg zãnga.",
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
    orientationDesc: "Wilg f zĩig, INO-Education na kõ-f sore-tũub sõngo.",
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

// ============================================================
// Requête authentifiée avec renouvellement automatique du jeton :
// si le serveur répond 401 (jeton expiré, ~1h de durée de vie), on essaie
// une seule fois de le renouveler silencieusement avant de redemander une
// vraie reconnexion à l'utilisateur.
// ============================================================
async function rafraichirJeton() {
  const jetonRafraichissement = localStorage.getItem("inous_jeton_rafraichissement");
  if (!jetonRafraichissement) return null;

  try {
    const res = await fetch("/api/auth/rafraichir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jeton_rafraichissement: jetonRafraichissement }),
    });
    if (!res.ok) throw new Error("échec du renouvellement");
    const data = await res.json();
    localStorage.setItem("inous_jeton", data.jeton);
    localStorage.setItem("inous_jeton_rafraichissement", data.jeton_rafraichissement);
    return data.jeton;
  } catch {
    // le renouvellement a échoué : la session est vraiment terminée
    localStorage.removeItem("inous_jeton");
    localStorage.removeItem("inous_jeton_rafraichissement");
    localStorage.removeItem("inous_email");
    return null;
  }
}

// enveloppe fetch() : ajoute automatiquement l'en-tête d'autorisation, et
// retente une fois avec un jeton neuf si le premier essai est refusé (401)
async function fetchAuthentifie(url, options = {}) {
  let jeton = localStorage.getItem("inous_jeton");
  const entetes = { ...(options.headers || {}), Authorization: `Bearer ${jeton}` };

  let reponse = await fetch(url, { ...options, headers: entetes });

  if (reponse.status === 401) {
    const nouveauJeton = await rafraichirJeton();
    if (nouveauJeton) {
      reponse = await fetch(url, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${nouveauJeton}` },
      });
    } else {
      appliquerEtatConnexion(); // met l'interface à jour : redevient "déconnecté"
    }
  }
  return reponse;
}

// envoie plusieurs fichiers l'un après l'autre vers la bibliothèque partagée,
// chacun gardant son nom de fichier comme titre — utilisé pour les envois en
// masse (des dizaines/centaines de documents à la fois)
async function envoyerDocumentsEnLot(fichiers, categorie, concours, zoneStatut, apresChaqueEnvoi) {
  const total = fichiers.length;
  let reussis = 0;
  let echecs = 0;
  const classificationAuto = categorie === "Auto";

  for (let i = 0; i < total; i++) {
    const fichier = fichiers[i];
    const nom = fichier.name.replace(/\.[^/.]+$/, "");
    zoneStatut.textContent = classificationAuto
      ? `Envoi ${i + 1}/${total} : ${nom}… (analyse par l'IA en cours)`
      : `Envoi ${i + 1}/${total} : ${nom}…`;

    try {
      const formData = new FormData();
      formData.append("fichier", fichier);
      formData.append("nom", nom);
      formData.append("categorie", categorie);
      if (concours) formData.append("concours", concours);

      const res = await fetchAuthentifie("/api/bibliotheque/partager", { method: "POST", body: formData });
      if (res.ok) {
        reussis++;
        if (classificationAuto) {
          const data = await res.json();
          zoneStatut.textContent = `Envoi ${i + 1}/${total} : ${nom} → classé "${data.categorie}"`;
        }
      } else {
        echecs++;
      }
    } catch {
      echecs++;
    }
  }

  zoneStatut.textContent = `✅ Terminé : ${reussis} envoyé${reussis > 1 ? "s" : ""}` + (echecs ? `, ⚠️ ${echecs} échec${echecs > 1 ? "s" : ""}.` : ".");
  if (apresChaqueEnvoi) apresChaqueEnvoi();
}


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
  ecranProfil.hidden = true;
  document.getElementById("ecran-calendrier").hidden = true;
  document.getElementById("ecran-enseignant").hidden = true;
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
    } else if (modeActif === "profil") {
      ecranProfil.hidden = false;
      chargerMonProfil();
    } else if (modeActif === "calendrier") {
      document.getElementById("ecran-calendrier").hidden = false;
      chargerCalendrier();
    } else if (modeActif === "enseignant") {
      document.getElementById("ecran-enseignant").hidden = false;
      chargerEspaceEnseignant();
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

// ---------- Étudier avec moi : niveaux et techniques d'apprentissage ----------
const NIVEAUX_ETUDE = [
  { id: "Maternelle", icone: "🧸", age: "3 – 5 ans" },
  { id: "Primaire", icone: "🎒", age: "6 – 11 ans" },
  { id: "Collège", icone: "📖", age: "12 – 15 ans" },
  { id: "Lycée", icone: "🎓", age: "16 – 18 ans" },
  { id: "Formation professionnelle", icone: "🛠️", age: "18 ans et +" },
  { id: "Université", icone: "🏛️", age: "Licence, Master, Doctorat" },
];

const TECHNIQUES_ETUDE = [
  { id: "lecture", icone: "📘", titre: "Lecture active", desc: "Comprends le cours en profondeur, étape par étape.", disponible: true },
  { id: "cartementale", icone: "🧠", titre: "Cartes mentales", desc: "Visualise les idées d'un sujet organisées en schéma.", disponible: true },
  { id: "exercices", icone: "📝", titre: "Exercices pratiques", desc: "Applique ce que tu apprends avec des exercices corrigés.", disponible: true },
  { id: "quiz", icone: "🎯", titre: "Quiz et auto-évaluation", desc: "Teste tes connaissances et suis ta progression.", disponible: true },
  { id: "fiches", icone: "📇", titre: "Fiches de révision", desc: "Révise avec des flashcards à répétition espacée.", disponible: true, outilDirect: "fiches" },
  { id: "memorisation", icone: "🧭", titre: "Techniques de mémorisation", desc: "Des astuces concrètes pour retenir à long terme.", disponible: true, outilDirect: "fiches" },
  { id: "devoirs", icone: "📚", titre: "Mes devoirs", desc: "Les devoirs assignés par ton enseignant pour cette classe.", disponible: true, outilDirect: "devoirs" },
  { id: "maitrise", icone: "📊", titre: "Ma maîtrise", desc: "Vois quels chapitres tu maîtrises déjà, ou pas encore.", disponible: true, outilDirect: "maitrise" },
  { id: "planning", icone: "📅", titre: "Planning de révision", desc: "Organise tes révisions avant un contrôle.", disponible: true, outilDirect: "planning" },
  { id: "video", icone: "🎥", titre: "Vidéos et exercices", desc: "Vidéos et exercices ajoutés pour ta classe.", disponible: true, outilDirect: "videos" },
  { id: "collaboratif", icone: "👥", titre: "Apprentissage collaboratif", desc: "Échange avec d'autres apprenants.", disponible: false },
];

let etudeNiveauChoisi = null;
let etudeTechniqueChoisie = null;

function rendreGrilleNiveauxEtude() {
  grilleNiveauxEtude.innerHTML = NIVEAUX_ETUDE.map((n) => `
    <button type="button" class="carte-niveau-etude" data-niveau="${n.id}">
      <span class="niveau-etude-icone">${n.icone}</span>
      <span class="niveau-etude-titre">${n.id}</span>
    </button>
  `).join("");
  grilleNiveauxEtude.querySelectorAll(".carte-niveau-etude").forEach((carte) => {
    carte.addEventListener("click", () => choisirNiveauEtude(carte.dataset.niveau));
  });
}
rendreGrilleNiveauxEtude();

const etudeEtapeMaternelle = document.getElementById("etude-etape-maternelle");
const grilleJeuxMaternelle = document.getElementById("grille-jeux-maternelle");
const zoneJeuMaternelle = document.getElementById("zone-jeu-maternelle");

// ---------- classes précises par niveau (système éducatif burkinabè) ----------
const CLASSES_PAR_NIVEAU = {
  "Primaire": { type: "flat", options: ["CP1", "CP2", "CE1", "CE2", "CM1", "CM2"] },
  "Collège": { type: "flat", options: ["6e", "5e", "4e", "3e"] },
  "Lycée": {
    type: "grade-serie",
    grades: {
      "Seconde": ["A", "C", "D", "E", "F", "G"],
      "Première": ["A", "C", "D", "E", "F", "G", "H"],
      "Terminale": ["A", "C", "D", "E", "F", "G", "H"],
    },
  },
  "Formation professionnelle": { type: "flat", options: ["1ère année", "2e année", "3e année", "Perfectionnement"] },
  "Université": {
    type: "univ",
    niveaux: ["L1", "L2", "L3", "M1", "M2", "D1", "D2", "D3+"],
    domaines: {
      "Sciences et Technologies": ["Mathématiques", "Informatique", "Statistique", "Intelligence Artificielle", "Data Science", "Physique", "Chimie", "Biologie", "Géologie"],
      "Économie et Gestion": ["Économie", "Gestion", "Comptabilité", "Finance", "Banque", "Assurance", "Marketing", "Commerce International", "Entrepreneuriat"],
      "Droit et Sciences Politiques": ["Droit Public", "Droit Privé", "Droit des Affaires", "Sciences Politiques", "Administration Publique"],
      "Lettres et Sciences Humaines": ["Histoire", "Géographie", "Philosophie", "Sociologie", "Psychologie", "Anthropologie", "Linguistique"],
      "Éducation": ["Sciences de l'Éducation", "Formation des Enseignants", "Inspection Pédagogique"],
      "Santé": ["Médecine", "Pharmacie", "Odontologie", "Sage-femme", "Infirmier", "Santé Publique", "Nutrition", "Kinésithérapie"],
      "Agriculture": ["Agronomie", "Productions végétales", "Productions animales", "Foresterie", "Environnement", "Hydraulique", "Agroalimentaire"],
      "Ingénierie": ["Génie Civil", "Génie Électrique", "Génie Mécanique", "Génie Industriel", "Génie Informatique", "Télécommunications"],
      "Communication": ["Journalisme", "Communication", "Audiovisuel", "Multimédia"],
      "Arts": ["Musique", "Théâtre", "Arts Plastiques", "Design", "Architecture"],
    },
  },
};

let classeChoisie = null;
let pileClasseNavigation = [];

function afficherEtapeClasse(rendreFn) {
  pileClasseNavigation.push(rendreFn);
  document.getElementById("btn-retour-classe-etape").hidden = pileClasseNavigation.length <= 1;
  rendreFn();
}

function retourEtapeClasse() {
  pileClasseNavigation.pop();
  if (pileClasseNavigation.length === 0) {
    etudeEtapeClasse.hidden = true;
    etudeEtapeNiveau.hidden = false;
    return;
  }
  document.getElementById("btn-retour-classe-etape").hidden = pileClasseNavigation.length <= 1;
  pileClasseNavigation[pileClasseNavigation.length - 1]();
}

function rendreClasseFlat(options, onChoix, sousTitre) {
  document.getElementById("etude-classe-sous-titre").textContent = sousTitre || "";
  const grille = document.getElementById("grille-classe-dynamique");
  grille.innerHTML = options.map((o) => `<button type="button" class="carte-classe" data-val="${o}">${o}</button>`).join("");
  grille.querySelectorAll(".carte-classe").forEach((bouton) => {
    bouton.addEventListener("click", () => onChoix(bouton.dataset.val));
  });
}

function demarrerSelectionClasse(niveau) {
  pileClasseNavigation = [];
  document.getElementById("etude-classe-niveau-titre").textContent = niveau;
  const config = CLASSES_PAR_NIVEAU[niveau];
  const etapeFinale = (label) => validerClasseEtPasserTechnique(label);

  if (!config || config.type === "flat") {
    afficherEtapeClasse(() => rendreClasseFlat(config.options, etapeFinale, "Choisis ta classe"));
  } else if (config.type === "grade-serie") {
    afficherEtapeClasse(() => rendreClasseFlat(Object.keys(config.grades), (grade) => {
      afficherEtapeClasse(() => rendreClasseFlat(
        config.grades[grade].map((s) => `${grade} ${s}`),
        etapeFinale,
        `Choisis ta série (${grade})`
      ));
    }, "Choisis ta classe"));
  } else if (config.type === "univ") {
    afficherEtapeClasse(() => rendreClasseFlat(config.niveaux, (annee) => {
      afficherEtapeClasse(() => rendreClasseFlat(Object.keys(config.domaines), (domaine) => {
        afficherEtapeClasse(() => rendreClasseFlat(
          config.domaines[domaine],
          (filiere) => etapeFinale(`${annee} — ${filiere}`),
          `Choisis ta filière (${domaine})`
        ));
      }, "Choisis ton domaine"));
    }, "Choisis ton année"));
  }
}

function validerClasseEtPasserTechnique(classe) {
  classeChoisie = classe;
  etudeEtapeClasse.hidden = true;
  etudeEtapeTechnique.hidden = false;
  etudeNiveauChoisiTitre.textContent = `${etudeNiveauChoisi} — ${classe}`;
  etudeSujetFormulaire.hidden = true;
  etudeTechniqueChoisie = null;
  document.getElementById("etude-bloc-choix-technique").hidden = false;
  document.getElementById("btn-retour-vers-techniques").hidden = true;
  document.getElementById("etude-outil-titre").hidden = true;
  document.getElementById("ressources-manuelles").hidden = true;
  rendreGrilleTechniques();
}

document.getElementById("btn-retour-classe-niveau").addEventListener("click", () => {
  pileClasseNavigation = [];
  etudeEtapeClasse.hidden = true;
  etudeEtapeNiveau.hidden = false;
});
document.getElementById("btn-retour-classe-etape").addEventListener("click", retourEtapeClasse);

document.getElementById("btn-retour-vers-techniques").addEventListener("click", () => {
  document.getElementById("etude-bloc-choix-technique").hidden = false;
  document.getElementById("btn-retour-vers-techniques").hidden = true;
  document.getElementById("etude-outil-titre").hidden = true;
  document.getElementById("ressources-manuelles").hidden = true;
  etudeSujetFormulaire.hidden = true;
  grilleTechniques.querySelectorAll(".carte-technique").forEach((c) => c.classList.remove("technique-selectionnee"));
});

function choisirNiveauEtude(niveau) {
  etudeNiveauChoisi = niveau;
  etudeNiveauChoisiTitre.textContent = niveau;
  etudeEtapeNiveau.hidden = true;

  if (niveau === "Maternelle") {
    etudeEtapeMaternelle.hidden = false;
    rendreGrilleJeuxMaternelle();
    return;
  }

  classeChoisie = null;
  etudeEtapeClasse.hidden = false;
  demarrerSelectionClasse(niveau);
}

document.getElementById("btn-retour-niveau-etude").addEventListener("click", () => {
  etudeEtapeTechnique.hidden = true;
  etudeEtapeNiveau.hidden = false;
});

document.getElementById("btn-retour-niveau-maternelle").addEventListener("click", () => {
  etudeEtapeMaternelle.hidden = true;
  zoneJeuMaternelle.hidden = true;
  etudeEtapeNiveau.hidden = false;
});

function rendreGrilleTechniques() {
  grilleTechniques.innerHTML = TECHNIQUES_ETUDE.map((t) => `
    <button type="button" class="carte-technique ${t.disponible ? "" : "technique-indisponible"}" data-technique="${t.id}" ${t.disponible ? "" : "disabled"}>
      <span class="technique-icone">${t.icone}</span>
      <div>
        <div class="technique-titre">${t.titre}</div>
        <div class="technique-desc">${t.desc}</div>
        ${!t.disponible ? `<span class="technique-badge">Bientôt disponible</span>` : ""}
      </div>
    </button>
  `).join("");

  grilleTechniques.querySelectorAll(".carte-technique:not(.technique-indisponible)").forEach((carte) => {
    carte.addEventListener("click", () => {
      grilleTechniques.querySelectorAll(".carte-technique").forEach((c) => c.classList.remove("technique-selectionnee"));
      carte.classList.add("technique-selectionnee");
      etudeTechniqueChoisie = carte.dataset.technique;
      const config = TECHNIQUES_ETUDE.find((t) => t.id === etudeTechniqueChoisie);

      if (config && config.outilDirect) {
        // Chaque technique ouvre sa propre page dediee
        document.getElementById("etude-bloc-choix-technique").hidden = true;
        etudeSujetFormulaire.hidden = true;

        const titreOutil = document.getElementById("etude-outil-titre");
        titreOutil.hidden = false;
        titreOutil.textContent = `${config.icone} ${config.titre}`;
        document.getElementById("btn-retour-vers-techniques").hidden = false;

        document.getElementById("ressources-manuelles").hidden = false;
        const panneauxParTechnique = { videos: ["videos", "exercices"], fiches: ["fiches"], maitrise: ["maitrise"], planning: ["planning"], devoirs: ["devoirs"] };
        const aAfficher = panneauxParTechnique[config.outilDirect] || [config.outilDirect];
        ongletRessourceActif = config.outilDirect;
        ["videos", "exercices", "fiches", "maitrise", "planning", "devoirs"].forEach((id) => {
          document.getElementById(`panneau-${id}`).hidden = !aAfficher.includes(id);
        });
        if (aAfficher.includes("fiches")) chargerFichesAReviser();
        if (aAfficher.includes("maitrise")) chargerMaitrise();
        if (aAfficher.includes("devoirs")) chargerDevoirsEleve();
        if (aAfficher.includes("videos")) { chargerVideos(); chargerExercicesPersonnalises(); }
        return;
      }

      document.getElementById("etude-bloc-choix-technique").hidden = true;
      document.getElementById("ressources-manuelles").hidden = true;
      const titreIA = document.getElementById("etude-outil-titre");
      titreIA.hidden = false;
      titreIA.textContent = `${config.icone} ${config.titre}`;
      document.getElementById("btn-retour-vers-techniques").hidden = false;
      etudeSujetFormulaire.hidden = false;
      if (typeof remplirMatieresDatalist === "function") remplirMatieresDatalist(classeChoisie);
      etudeMatiereV2.focus();
    });
  });
}

// ---------- ressources manuelles : vidéos et exercices ajoutés par un utilisateur ----------
const ressourceMatiere = document.getElementById("ressource-matiere");
let ongletRessourceActif = "videos";

function classeEtMatiereRessource() {
  return { classe: classeChoisie || etudeNiveauChoisi || "", matiere: ressourceMatiere.value.trim() };
}

async function chargerVideos() {
  const { classe, matiere } = classeEtMatiereRessource();
  const liste = document.getElementById("liste-videos");
  if (!matiere) { liste.innerHTML = `<p class="chargement-guide">Indique une matière pour voir/ajouter des vidéos.</p>`; return; }
  liste.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetch(`/api/videos?matiere=${encodeURIComponent(matiere)}&classe=${encodeURIComponent(classe)}`);
    const videos = await res.json();
    liste.innerHTML = videos.length
      ? videos.map((v) => `
          <div class="carte-ressource">
            <div><div class="carte-ressource-titre">🎥 ${echapperHtml(v.titre)}</div><div class="carte-ressource-meta">${v.type === "lien" ? "Lien externe" : "Fichier uploadé"}</div></div>
            <a href="${echapperHtml(v.url)}" target="_blank" rel="noopener">Voir ▶</a>
          </div>`).join("")
      : `<p class="chargement-guide">Aucune vidéo pour l'instant.</p>`;
  } catch {
    liste.innerHTML = `<p class="chargement-guide">Aucune vidéo pour l'instant.</p>`;
  }
}

async function chargerExercicesPersonnalises() {
  const { classe, matiere } = classeEtMatiereRessource();
  const liste = document.getElementById("liste-exercices");
  if (!matiere) { liste.innerHTML = `<p class="chargement-guide">Indique une matière pour voir/ajouter des exercices.</p>`; return; }
  liste.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetch(`/api/exercices?matiere=${encodeURIComponent(matiere)}&classe=${encodeURIComponent(classe)}`);
    const exercices = await res.json();
    liste.innerHTML = exercices.length
      ? exercices.map((e) => `<div class="carte-ressource"><div class="carte-ressource-titre">📝 ${echapperHtml(e.question)}</div></div>`).join("")
      : `<p class="chargement-guide">Aucun exercice pour l'instant.</p>`;
  } catch {
    liste.innerHTML = `<p class="chargement-guide">Aucun exercice pour l'instant.</p>`;
  }
}

ressourceMatiere.addEventListener("change", () => { chargerVideos(); chargerExercicesPersonnalises(); });

document.getElementById("btn-ouvrir-form-video").addEventListener("click", () => {
  document.getElementById("formulaire-video").hidden = false;
});
document.querySelectorAll('input[name="type-video"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const estFichier = document.querySelector('input[name="type-video"]:checked').value === "fichier";
    document.getElementById("video-url").hidden = estFichier;
    document.getElementById("video-fichier").hidden = !estFichier;
  });
});

document.getElementById("btn-valider-video").addEventListener("click", async () => {
  const { classe, matiere } = classeEtMatiereRessource();
  const titre = document.getElementById("video-titre").value.trim();
  const estFichier = document.querySelector('input[name="type-video"]:checked').value === "fichier";
  const statut = document.getElementById("statut-video");

  if (!matiere || !titre) { alert("Indique la matière et un titre pour la vidéo."); return; }
  statut.textContent = "Envoi en cours…";

  try {
    let res;
    if (estFichier) {
      const fichier = document.getElementById("video-fichier").files[0];
      if (!fichier) { alert("Choisis un fichier vidéo."); statut.textContent = ""; return; }
      const formData = new FormData();
      formData.append("fichier", fichier);
      formData.append("matiere", matiere);
      formData.append("classe", classe);
      formData.append("titre", titre);
      res = await fetchAuthentifie("/api/videos/fichier", { method: "POST", body: formData });
    } else {
      const url = document.getElementById("video-url").value.trim();
      if (!url) { alert("Colle un lien vers la vidéo."); statut.textContent = ""; return; }
      res = await fetchAuthentifie("/api/videos/lien", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matiere, classe, titre, url }),
      });
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    statut.textContent = "✅ Vidéo ajoutée !";
    document.getElementById("video-titre").value = "";
    document.getElementById("video-url").value = "";
    chargerVideos();
  } catch (erreur) {
    statut.textContent = "⚠️ " + erreur.message;
  }
});

document.getElementById("btn-ouvrir-form-exercice").addEventListener("click", () => {
  document.getElementById("formulaire-exercice").hidden = false;
});

document.getElementById("btn-valider-exercice").addEventListener("click", async () => {
  const { classe, matiere } = classeEtMatiereRessource();
  const question = document.getElementById("exercice-question").value.trim();
  const choix = [0, 1, 2, 3].map((i) => document.getElementById(`exercice-choix-${i}`).value.trim());
  const reponseIndex = Number(document.querySelector('input[name="bonne-reponse"]:checked').value);
  const explication = document.getElementById("exercice-explication").value.trim();
  const statut = document.getElementById("statut-exercice");

  if (!matiere || !question || choix.some((c) => !c)) { alert("Remplis la matière, la question et les 4 choix."); return; }
  statut.textContent = "Envoi en cours…";

  try {
    const res = await fetchAuthentifie("/api/exercices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere, classe, question, choix, reponse_index: reponseIndex, explication }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    statut.textContent = "✅ Exercice ajouté !";
    document.getElementById("exercice-question").value = "";
    choix.forEach((_, i) => (document.getElementById(`exercice-choix-${i}`).value = ""));
    document.getElementById("exercice-explication").value = "";
    chargerExercicesPersonnalises();
  } catch (erreur) {
    statut.textContent = "⚠️ " + erreur.message;
  }
});

// ---------- Fiches de révision (répétition espacée) ----------
async function chargerFichesAReviser() {
  const { classe, matiere } = classeEtMatiereRessource();
  const liste = document.getElementById("liste-fiches");
  if (!matiere) { liste.innerHTML = `<p class="chargement-guide">Indique une matière pour voir tes fiches.</p>`; return; }
  liste.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetchAuthentifie(`/api/fiches/a-reviser?matiere=${encodeURIComponent(matiere)}&classe=${encodeURIComponent(classe)}`);
    const fiches = await res.json();
    if (!fiches.length) { liste.innerHTML = `<p class="chargement-guide">Aucune fiche à réviser pour l'instant — génères-en de nouvelles ci-dessous !</p>`; return; }
    afficherFiche(fiches, 0, liste);
  } catch {
    liste.innerHTML = `<p class="chargement-guide">Connecte-toi pour voir tes fiches.</p>`;
  }
}

function afficherFiche(fiches, index, conteneur) {
  if (index >= fiches.length) {
    conteneur.innerHTML = `<p class="chargement-guide">🎉 Toutes tes fiches du jour sont faites !</p>`;
    return;
  }
  const f = fiches[index];
  conteneur.innerHTML = `
    <div class="jeu-mat-score">${index + 1} / ${fiches.length}</div>
    <div class="fiche-flip" id="fiche-flip-actuelle">
      <div class="fiche-flip-interieur">
        <div class="fiche-face fiche-recto">${echapperHtml(f.recto)}</div>
        <div class="fiche-face fiche-verso">${echapperHtml(f.verso)}</div>
      </div>
    </div>
    <p class="guide-desc" style="text-align:center;">Touche la carte pour voir la réponse</p>
    <div class="fiche-boutons-reponse" id="fiche-boutons" hidden>
      <button type="button" class="bouton-envoyer" id="btn-fiche-non" style="background:var(--erreur);">😕 Je ne savais pas</button>
      <button type="button" class="bouton-envoyer" id="btn-fiche-oui">😊 Je savais</button>
    </div>
  `;
  const carte = document.getElementById("fiche-flip-actuelle");
  carte.addEventListener("click", () => {
    carte.classList.add("retournee");
    document.getElementById("fiche-boutons").hidden = false;
  });
  const repondre = async (correct) => {
    try { await fetchAuthentifie(`/api/fiches/${f.id}/repondre`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correct }),
    }); } catch { /* best-effort */ }
    afficherFiche(fiches, index + 1, conteneur);
  };
  document.getElementById("btn-fiche-oui").addEventListener("click", () => repondre(true));
  document.getElementById("btn-fiche-non").addEventListener("click", () => repondre(false));
}

document.getElementById("btn-generer-fiches").addEventListener("click", async () => {
  const { classe, matiere } = classeEtMatiereRessource();
  const sujet = document.getElementById("fiches-sujet").value.trim();
  const statut = document.getElementById("statut-fiches");
  if (!matiere || !sujet) { alert("Indique la matière et un sujet précis."); return; }
  statut.textContent = texteTraduit("reflexion");
  try {
    const res = await fetchAuthentifie("/api/fiches/generer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere, classe, sujet, texte_source: etudePdfTexte }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    statut.textContent = `✅ ${data.length} fiches créées !`;
    document.getElementById("fiches-sujet").value = "";
    chargerFichesAReviser();
  } catch (erreur) {
    statut.textContent = "⚠️ " + erreur.message;
  }
});

document.getElementById("btn-techniques-memorisation").addEventListener("click", async () => {
  const { matiere } = classeEtMatiereRessource();
  const sujet = document.getElementById("fiches-sujet").value.trim() || etudeContexte.sujet;
  const resultat = document.getElementById("techniques-memorisation-resultat");
  if (!matiere || !sujet) { alert("Indique la matière et un sujet (dans le champ ci-dessus)."); return; }

  resultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  const contextePdf = etudePdfTexte
    ? `Base-toi sur ce cours réel fourni par l'élève :\n"""${etudePdfTexte.slice(0, 6000)}"""\n\n`
    : "";
  const prompt = contextePdf + `Propose 3 à 4 techniques concrètes de mémorisation à long terme (moyens mnémotechniques, ` +
    `associations d'idées, méthode des loci, acronymes, histoires imagées...) pour retenir durablement les définitions ` +
    `et notions clés sur "${sujet}" (matière : ${matiere}). Sois concret : donne l'astuce ET un exemple appliqué à ce sujet précis, pas juste la théorie générale.`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    resultat.innerHTML = `<div class="tableau-texte" style="background:linear-gradient(160deg,#3a2d5c,#2a2048);">${echapperHtml(data.reponse).replace(/\n/g, "<br>")}</div>`;
  } catch (erreur) {
    resultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
});

// ---------- Suivi de maîtrise par chapitre ----------
const LIBELLES_MAITRISE = { maitrise: "✅ Maîtrisé", en_cours: "🟡 En cours", a_retravailler: "🔴 À retravailler", non_teste: "⚪ Non testé" };

async function chargerMaitrise() {
  const liste = document.getElementById("liste-maitrise");
  liste.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetchAuthentifie(`/api/profil/maitrise?classe=${encodeURIComponent(classeChoisie || etudeNiveauChoisi || "")}`);
    const donnees = await res.json();
    liste.innerHTML = donnees.length
      ? donnees.map((d) => `
          <div class="ligne-maitrise">
            <div><strong>${echapperHtml(d.matiere)}</strong> — ${echapperHtml(d.sujet)}${d.moyenne !== null ? ` (${Math.round(d.moyenne * 100)}%)` : ""}</div>
            <span class="badge-maitrise ${d.niveau}">${LIBELLES_MAITRISE[d.niveau]}</span>
          </div>`).join("")
      : `<p class="chargement-guide">Pas encore assez d'activité pour cette classe — fais quelques cours et quiz d'abord !</p>`;
  } catch {
    liste.innerHTML = `<p class="chargement-guide">Connecte-toi pour voir ta maîtrise.</p>`;
  }
}

// ---------- Planning de révision avant un contrôle ----------
document.getElementById("btn-generer-planning").addEventListener("click", async () => {
  const { classe, matiere } = classeEtMatiereRessource();
  const date = document.getElementById("planning-date").value;
  const chapitres = document.getElementById("planning-chapitres").value.trim();
  const resultat = document.getElementById("planning-resultat");
  if (!matiere || !date || !chapitres) { alert("Indique la matière, la date du contrôle et les chapitres."); return; }

  resultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  const aujourdHui = new Date().toISOString().split("T")[0];
  const prompt = `Nous sommes le ${aujourdHui}. Un élève de ${classe} a un contrôle de ${matiere} le ${date}, sur les chapitres suivants : ${chapitres}. ` +
    `Propose un planning de révision jour par jour jusqu'à cette date, réaliste (pas plus d'1h par jour), en répartissant les chapitres. ` +
    `Réponds en texte simple, organisé par jour.`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    resultat.textContent = data.reponse;
  } catch (erreur) {
    resultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
});

// ---------- import PDF optionnel pour baser le cours sur un vrai document ----------
let etudePdfTexte = null;
let etudePdfNom = null;

document.getElementById("etude-pdf-fichier").addEventListener("change", async () => {
  const fichier = document.getElementById("etude-pdf-fichier").files[0];
  const statut = document.getElementById("etude-pdf-statut");
  if (!fichier) return;

  statut.hidden = false;
  statut.innerHTML = `<span>${texteTraduit("reflexion")}</span>`;

  const controleur = new AbortController();
  const delaiExpiration = setTimeout(() => controleur.abort(), 45000); // jamais bloqué plus de 45s

  try {
    const formData = new FormData();
    formData.append("fichier", fichier);
    const res = await fetch("/api/importer-pdf", { method: "POST", body: formData, signal: controleur.signal });
    clearTimeout(delaiExpiration);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    etudePdfTexte = data.texte;
    etudePdfNom = data.nom;
    statut.innerHTML = `<span>📄 ${echapperHtml(etudePdfNom)}${data.tronque ? " (partiel)" : ""}</span><button type="button" id="btn-retirer-pdf-etude">Retirer</button>`;
    document.getElementById("btn-retirer-pdf-etude").addEventListener("click", () => {
      etudePdfTexte = null;
      etudePdfNom = null;
      document.getElementById("etude-pdf-fichier").value = "";
      statut.hidden = true;
    });
  } catch (erreur) {
    clearTimeout(delaiExpiration);
    const message = erreur.name === "AbortError"
      ? "Le PDF est trop volumineux ou trop lent à traiter (plus de 45s). Essaie un fichier plus léger."
      : erreur.message;
    statut.innerHTML = `<span>⚠️ ${echapperHtml(message)}</span>`;
  }
});

document.getElementById("btn-commencer-technique").addEventListener("click", () => {
  const matiere = etudeMatiereV2.value.trim();
  const sujet = etudeSujetV2.value.trim();
  if (!matiere || !sujet) {
    alert("Indique une matière et un sujet avant de commencer.");
    return;
  }
  demarrerSeanceEtude(classeChoisie || etudeNiveauChoisi, matiere, sujet, etudeTechniqueChoisie);
});

document.getElementById("btn-retour-technique-etude").addEventListener("click", () => {
  etudeSession.hidden = true;
  etudeEtapeTechnique.hidden = false;
});


// ============================================================
// ÉTUDIER AVEC MOI : séance guidée en 6 étapes (dans la session en cours)
// ============================================================
const etudeSession = document.getElementById("etude-session");
const etudePlanAside = document.getElementById("etude-plan-aside");
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

function demarrerSeanceEtude(niveau, matiere, sujet, technique) {
  etudeContexte = { parcours: niveau, matiere, sujet };
  etudeExercicesGeneres = [];
  etudeEtapeTechnique.hidden = true;
  etudeSession.hidden = false;

  if (technique === "cartementale") {
    etudePlanAside.hidden = true;
    afficherCarteMentale();
    return;
  }
  etudePlanAside.hidden = false;

  const etapeDepart = technique === "quiz" ? "quiz" : technique === "exercices" ? "exercices" : "cours";
  etudeEtapeActuelle = ORDRE_ETAPES.indexOf(etapeDepart);
  mettreAJourPlan();
  chargerEtape(etapeDepart);
}

function libelleParcoursPourPrompt() {
  const { parcours, matiere } = etudeContexte;
  return `niveau ${parcours}, matière ${matiere}`;
}

async function chargerEtape(etape, instructionSupplementaire) {
  etudeContenuEl.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const { sujet } = etudeContexte;
  const base = libelleParcoursPourPrompt();
  const contextePdf = etudePdfTexte
    ? `\n\nBase-toi PRINCIPALEMENT sur le contenu réel de ce document fourni par l'utilisateur (ne t'en écarte pas, n'invente rien qui le contredit) :\n"""${etudePdfTexte.slice(0, 6000)}"""\n`
    : "";
  let prompt = "";

  if (etape === "cours") {
    prompt = `Fais un cours clair sur "${sujet}" (${base}). Structure : une définition précise, puis les points clés. ` +
      `Utilise du LaTeX entre symboles $ pour toute formule mathématique s'il y en a. Reste concis (une leçon, pas un livre). ` +
      (instructionSupplementaire || "") + (typeof instructionPedagogique === "function" ? instructionPedagogique(etudeContexte.matiere, etudeContexte.parcours) : "") + contextePdf;
  } else if (etape === "exemple") {
    prompt = `Donne un exemple concret entièrement résolu, étape par étape, sur "${sujet}" (${base}). Utilise du LaTeX entre $ pour les formules.` + (typeof instructionPedagogique === "function" ? instructionPedagogique(etudeContexte.matiere, etudeContexte.parcours) : "") + contextePdf;
  } else if (etape === "exercices") {
    prompt = `Propose exactement 4 exercices d'entraînement sur "${sujet}" (${base}), de difficulté progressive. ` +
      `Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, au format : ` +
      `[{"titre": "...", "difficulte": "Facile|Moyen|Difficile", "enonce": "..."}]` + contextePdf;
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
      let data, reponseValide = false;

      for (let essai = 0; essai < 2 && !reponseValide; essai++) {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value, structuree }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
        if (!structuree) { reponseValide = true; break; }
        try {
          const test = extraireJSONObjet(data.reponse);
          const explicationsValides = Array.isArray(test.explications) ? test.explications.length > 0 : !!test.explications;
          reponseValide = !!(test.definition && explicationsValides && Array.isArray(test.exemples) && test.exemples.length >= 2);
        } catch {
          reponseValide = false;
        }
      }

      if (etape === "cours") {
        etudeCoursTexteBrut = data.reponse;
        enregistrerActivite("cours", etudeContexte.matiere, etudeContexte.sujet, null, null, etudeContexte.parcours);
      }
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
    const questions = await demanderTableauJSON(prompt, selecteurLangue.value);

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
              enregistrerActivite("quiz", etudeContexte.matiere, etudeContexte.sujet, score, questions.length, etudeContexte.parcours);
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
    lien.download = "reponse-ino-education.txt";
    lien.click();
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const texte = texteTelechargeableDepuisReponse(texteReponseBrut);
  const largeurUtile = 180;

  doc.setFontSize(16);
  doc.text("INO-Education", 15, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleDateString("fr-FR"), 15, 24);
  doc.setTextColor(20);
  doc.setFontSize(11);

  const lignes = doc.splitTextToSize(texte, largeurUtile);
  doc.text(lignes, 15, 36);
  doc.save("reponse-ino-education.pdf");
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

// demande un tableau JSON à l'IA (questions de quiz, exercices...) avec une
// nouvelle tentative automatique si le modèle ne renvoie pas un JSON valide
// du premier coup — ça arrive, et sans ce filet le quiz semblait "ne pas marcher"
async function demanderTableauJSON(prompt, langue) {
  let derniereErreur;
  for (let essai = 0; essai < 2; essai++) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, historique: [], langue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
      return extraireJSON(data.reponse);
    } catch (erreur) {
      derniereErreur = erreur;
    }
  }
  throw derniereErreur;
}

async function demanderObjetJSON(prompt, langue) {
  let derniereErreur;
  for (let essai = 0; essai < 2; essai++) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, historique: [], langue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
      return extraireJSONObjet(data.reponse);
    } catch (erreur) {
      derniereErreur = erreur;
    }
  }
  throw derniereErreur;
}

// ---------- carte mentale : l'IA fournit la structure, le code dessine le schéma ----------
function construireCarteMentaleSVG(donnees) {
  const branches = (donnees.branches || []).slice(0, 6);
  const largeur = 700, hauteur = 560, cx = largeur / 2, cy = hauteur / 2;
  const rayon = 200;
  const couleurs = ["#5fbf8a", "#5b9bd5", "#8b6fd8", "#e8b75c", "#d97b6c", "#4a9e6c"];

  let contenu = "";
  branches.forEach((branche, i) => {
    const angle = (i / branches.length) * 2 * Math.PI - Math.PI / 2;
    const bx = cx + rayon * Math.cos(angle);
    const by = cy + rayon * Math.sin(angle);
    const couleur = couleurs[i % couleurs.length];

    contenu += `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="${couleur}" stroke-width="2" opacity="0.5"/>`;
    contenu += `<circle cx="${bx}" cy="${by}" r="8" fill="${couleur}"/>`;

    const alignement = Math.cos(angle) > 0.3 ? "start" : Math.cos(angle) < -0.3 ? "end" : "middle";
    const decalageX = Math.cos(angle) > 0.3 ? 14 : Math.cos(angle) < -0.3 ? -14 : 0;
    const decalageY = Math.sin(angle) > 0 ? 24 : -14;

    contenu += `<text x="${bx + decalageX}" y="${by + decalageY}" font-size="14" font-weight="700" fill="${couleur}" text-anchor="${alignement}">${echapperHtml(branche.titre || "")}</text>`;
    (branche.points || []).slice(0, 3).forEach((point, j) => {
      contenu += `<text x="${bx + decalageX}" y="${by + decalageY + 18 + j * 16}" font-size="11" fill="#cdd6c8" text-anchor="${alignement}">${echapperHtml(point)}</text>`;
    });
  });

  return `
    <svg viewBox="0 0 ${largeur} ${hauteur}" class="carte-mentale-svg">
      ${contenu}
      <circle cx="${cx}" cy="${cy}" r="60" fill="var(--accent)" opacity="0.9"/>
      <foreignObject x="${cx - 55}" y="${cy - 30}" width="110" height="60">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:12px;font-weight:700;color:#1c2418;text-align:center;display:flex;align-items:center;justify-content:center;height:100%;">${echapperHtml(donnees.centre || "")}</div>
      </foreignObject>
    </svg>
  `;
}

async function afficherCarteMentale() {
  etudeContenuEl.innerHTML = `<span class="etude-etiquette-etape">🧠 CARTE MENTALE</span><p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  const { matiere, sujet } = etudeContexte;
  const prompt = `Crée une carte mentale sur le sujet "${sujet}" (matière : ${matiere}, niveau ${etudeContexte.parcours}). ` +
    `Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format : ` +
    `{"centre": "titre très court du sujet", "branches": [{"titre": "nom de la branche", "points": ["point clé 1", "point clé 2"]}, ...]} ` +
    `avec entre 4 et 6 branches pertinentes.`;

  try {
    const donnees = await demanderObjetJSON(prompt, selecteurLangue.value);
    etudeContenuEl.innerHTML = `
      <span class="etude-etiquette-etape">🧠 CARTE MENTALE</span>
      ${construireCarteMentaleSVG(donnees)}
    `;
  } catch {
    etudeContenuEl.innerHTML = `<span class="etude-etiquette-etape">🧠 CARTE MENTALE</span><p>⚠️ ${texteTraduit("jeuxErreur")}</p>`;
  }
}

// ============================================================
// MATERNELLE : 5 jeux éducatifs, 100% emoji (pas d'images à charger),
// tactile-friendly, aucun appel réseau nécessaire pour jouer
// ============================================================
const JEUX_MATERNELLE = [
  { id: "tri", classe: "jeu-mat-tri", icone: "🗂️", titre: "Tri et classement", desc: "Range chaque objet dans le bon panier" },
  { id: "memoire", classe: "jeu-mat-memoire", icone: "🧩", titre: "Jeux de mémoire", desc: "Retrouve les paires cachées" },
  { id: "comptage", classe: "jeu-mat-comptage", icone: "🔢", titre: "Comptage", desc: "Compte les objets à l'écran" },
  { id: "association", classe: "jeu-mat-association", icone: "🔗", titre: "Jeux d'association", desc: "Relie deux images qui vont ensemble" },
  { id: "reconnaissance", classe: "jeu-mat-reconnaissance", icone: "👀", titre: "Reconnaissance", desc: "Trouve la bonne forme ou couleur" },
  { id: "coloriage", classe: "jeu-mat-coloriage", icone: "🎨", titre: "Coloriage", desc: "Colorie le dessin comme tu veux" },
  { id: "puzzle", classe: "jeu-mat-puzzle", icone: "🧷", titre: "Puzzle", desc: "Remets les pièces dans le bon ordre" },
  { id: "labyrinthe", classe: "jeu-mat-labyrinthe", icone: "🌀", titre: "Labyrinthes", desc: "Trouve le bon chemin jusqu'à l'arrivée" },
  { id: "completer", classe: "jeu-mat-completer", icone: "🧩", titre: "Compléter l'image", desc: "Devine ce qui manque" },
  { id: "chansons", classe: "jeu-mat-chansons", icone: "🎵", titre: "Chansons et comptines", desc: "Une petite comptine rien que pour toi" },
  { id: "maitre", classe: "jeu-mat-maitre", icone: "👨‍🏫", titre: "Mon Maître", desc: "Une vraie leçon avec ton professeur" },
];

function rendreGrilleJeuxMaternelle() {
  zoneJeuMaternelle.hidden = true;
  grilleJeuxMaternelle.hidden = false;
  grilleJeuxMaternelle.innerHTML = JEUX_MATERNELLE.map((j) => `
    <button type="button" class="carte-jeu-maternelle ${j.classe}" data-jeu="${j.id}">
      <span class="jeu-mat-icone">${j.icone}</span>
      <span class="jeu-mat-titre">${j.titre}</span>
      <span class="jeu-mat-desc">${j.desc}</span>
    </button>
  `).join("");
  grilleJeuxMaternelle.querySelectorAll(".carte-jeu-maternelle").forEach((carte) => {
    carte.addEventListener("click", () => lancerJeuMaternelle(carte.dataset.jeu));
  });
}

function retourGrilleJeux() {
  grilleJeuxMaternelle.hidden = false;
  zoneJeuMaternelle.hidden = true;
}

function lancerJeuMaternelle(id) {
  grilleJeuxMaternelle.hidden = true;
  zoneJeuMaternelle.hidden = false;
  if (id === "tri") lancerJeuTri();
  else if (id === "memoire") lancerJeuMemoire();
  else if (id === "comptage") lancerJeuComptage();
  else if (id === "association") lancerJeuAssociation();
  else if (id === "reconnaissance") lancerJeuReconnaissance();
  else if (id === "coloriage") lancerJeuColoriage();
  else if (id === "puzzle") lancerJeuPuzzle();
  else if (id === "labyrinthe") lancerJeuLabyrinthe();
  else if (id === "completer") lancerJeuCompleter();
  else if (id === "chansons") lancerJeuChansons();
  else if (id === "maitre") lancerMonMaitre();
}

function feteVictoireMaternelle(nomJeu, score, total) {
  zoneJeuMaternelle.innerHTML = `
    <div class="jeu-mat-fin">
      🎉 Bravo ! ${score} / ${total} 🌟
      <br><br>
      <button type="button" class="bouton-envoyer bouton-guide" id="btn-rejouer-maternelle">🔁 Rejouer</button>
      <button type="button" class="bouton-etape-nav" id="btn-autres-jeux-maternelle" style="margin-left:10px;">Autres jeux</button>
    </div>
  `;
  document.getElementById("btn-rejouer-maternelle").addEventListener("click", () => lancerJeuMaternelle(nomJeu.id));
  document.getElementById("btn-autres-jeux-maternelle").addEventListener("click", retourGrilleJeux);
  enregistrerActivite("jeu", "Maternelle", nomJeu.titre, score, total);
  if (window.speechSynthesis) lireAudioHorsLigne("Bravo, bien joué !");
}

function melanger(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// ---------- 1. Tri et classement ----------
const BANQUES_TRI = [
  { bacs: [{ nom: "Animaux", emoji: "🐾" }, { nom: "Fruits", emoji: "🍎" }],
    objets: [["🐶","Animaux"],["🍌","Fruits"],["🐱","Animaux"],["🍇","Fruits"],["🦁","Animaux"],["🍊","Fruits"],["🐰","Animaux"],["🍓","Fruits"]] },
  { bacs: [{ nom: "Véhicules", emoji: "🚗" }, { nom: "Jouets", emoji: "🧸" }],
    objets: [["🚙","Véhicules"],["🪀","Jouets"],["🚲","Véhicules"],["🎲","Jouets"],["✈️","Véhicules"],["🪁","Jouets"],["🚌","Véhicules"],["🎈","Jouets"]] },
];

function lancerJeuTri() {
  const banque = BANQUES_TRI[Math.floor(Math.random() * BANQUES_TRI.length)];
  const objets = melanger(banque.objets).slice(0, 6);
  let index = 0, score = 0;
  let objetSelectionne = null;

  const afficher = () => {
    if (index >= objets.length) {
      feteVictoireMaternelle({ id: "tri", titre: "Tri et classement" }, score, objets.length);
      return;
    }
    const [emoji] = objets[index];
    zoneJeuMaternelle.innerHTML = `
      <p class="jeu-mat-consigne">Range ${emoji} dans le bon panier !</p>
      <div class="jeu-mat-score">${index + 1} / ${objets.length}</div>
      <div class="jeu-mat-objets"><span class="bouton-jeu-mat jeu-mat-selectionne">${emoji}</span></div>
      <div class="jeu-mat-bacs">
        ${banque.bacs.map((b) => `<button type="button" class="bac-tri" data-bac="${b.nom}"><span style="font-size:2rem;">${b.emoji}</span><div class="bac-titre">${b.nom}</div></button>`).join("")}
      </div>
    `;
    zoneJeuMaternelle.querySelectorAll(".bac-tri").forEach((bac) => {
      bac.addEventListener("click", () => {
        const [, bonneReponse] = objets[index];
        const correct = bac.dataset.bac === bonneReponse;
        bac.classList.add(correct ? "bac-actif" : "");
        if (correct) score++;
        if (window.speechSynthesis) lireAudioHorsLigne(correct ? "Bravo !" : "Essaie encore la prochaine fois !");
        setTimeout(() => { index++; afficher(); }, 700);
      });
    });
  };
  afficher();
}

// ---------- 2. Jeux de mémoire ----------
const EMOJIS_MEMOIRE = ["🐶","🐱","🐰","🦁","🐸","🐵","🦋","🐝","🐦","🐟","🌸","⭐"];

function lancerJeuMemoire() {
  const paires = melanger(EMOJIS_MEMOIRE).slice(0, 6);
  const cartes = melanger([...paires, ...paires]);
  let retournees = [];
  let trouvees = 0;
  let bloque = false;

  zoneJeuMaternelle.innerHTML = `
    <p class="jeu-mat-consigne">Retrouve les paires !</p>
    <div class="jeu-mat-score" id="memoire-score">0 / ${paires.length} paires</div>
    <div class="grille-memoire" id="grille-memoire-jeu">
      ${cartes.map((_, i) => `<button type="button" class="carte-memoire" data-index="${i}">❔</button>`).join("")}
    </div>
  `;

  const boutons = zoneJeuMaternelle.querySelectorAll(".carte-memoire");
  boutons.forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const i = Number(bouton.dataset.index);
      if (bloque || bouton.classList.contains("trouvee") || retournees.includes(i)) return;

      bouton.textContent = cartes[i];
      bouton.classList.add("retournee");
      retournees.push(i);

      if (retournees.length === 2) {
        bloque = true;
        const [a, b] = retournees;
        if (cartes[a] === cartes[b]) {
          boutons[a].classList.add("trouvee");
          boutons[b].classList.add("trouvee");
          trouvees++;
          document.getElementById("memoire-score").textContent = `${trouvees} / ${paires.length} paires`;
          retournees = [];
          bloque = false;
          if (trouvees === paires.length) {
            setTimeout(() => feteVictoireMaternelle({ id: "memoire", titre: "Jeux de mémoire" }, trouvees, paires.length), 500);
          }
        } else {
          setTimeout(() => {
            boutons[a].textContent = "❔";
            boutons[b].textContent = "❔";
            boutons[a].classList.remove("retournee");
            boutons[b].classList.remove("retournee");
            retournees = [];
            bloque = false;
          }, 800);
        }
      }
    });
  });
}

// ---------- 3. Comptage ----------
const OBJETS_COMPTAGE = ["🍎","⭐","🎈","🐟","🌸","🍓","🦋","🐝"];

function lancerJeuComptage() {
  let index = 0, score = 0;
  const rondes = 5;

  const afficher = () => {
    if (index >= rondes) {
      feteVictoireMaternelle({ id: "comptage", titre: "Comptage" }, score, rondes);
      return;
    }
    const emoji = OBJETS_COMPTAGE[Math.floor(Math.random() * OBJETS_COMPTAGE.length)];
    const nombre = Math.floor(Math.random() * 8) + 2; // 2 à 9
    const choix = melanger([nombre, nombre + 1, Math.max(1, nombre - 1), nombre + 2].filter((n, i, arr) => arr.indexOf(n) === i)).slice(0, 4);

    zoneJeuMaternelle.innerHTML = `
      <p class="jeu-mat-consigne">Combien y a-t-il de ${emoji} ?</p>
      <div class="jeu-mat-score">${index + 1} / ${rondes}</div>
      <div class="jeu-mat-objets">${emoji.repeat(nombre).split("").map((e) => `<span>${e}</span>`).join("")}</div>
      <div class="jeu-mat-choix">${choix.map((c) => `<button type="button" class="bouton-jeu-mat" data-valeur="${c}">${c}</button>`).join("")}</div>
    `;
    zoneJeuMaternelle.querySelectorAll(".bouton-jeu-mat").forEach((bouton) => {
      bouton.addEventListener("click", () => {
        const correct = Number(bouton.dataset.valeur) === nombre;
        bouton.classList.add(correct ? "jeu-mat-correct" : "jeu-mat-incorrect");
        if (correct) score++;
        if (window.speechSynthesis) lireAudioHorsLigne(correct ? "Bravo !" : "Presque, réessaie !");
        setTimeout(() => { index++; afficher(); }, 700);
      });
    });
  };
  afficher();
}

// ---------- 4. Jeux d'association ----------
const PAIRES_ASSOCIATION = [
  ["🐄","🥛"], ["🐝","🍯"], ["🌧️","☂️"], ["🔑","🔒"], ["✂️","📄"],
  ["🖊️","📝"], ["🌙","⭐"], ["☀️","🌻"], ["🐔","🥚"], ["🌳","🍃"],
];

function lancerJeuAssociation() {
  const paires = melanger(PAIRES_ASSOCIATION).slice(0, 4);
  const gauche = paires.map((p) => p[0]);
  const droite = melanger(paires.map((p) => p[1]));
  let selectionGauche = null;
  let trouvees = 0;

  const rendre = () => {
    zoneJeuMaternelle.innerHTML = `
      <p class="jeu-mat-consigne">Relie ce qui va ensemble !</p>
      <div class="jeu-mat-score">${trouvees} / ${paires.length}</div>
      <div class="jeu-mat-colonnes">
        <div class="jeu-mat-colonne">${gauche.map((e) => `<button type="button" class="bouton-jeu-mat" data-emoji="${e}">${e}</button>`).join("")}</div>
        <div class="jeu-mat-colonne">${droite.map((e) => `<button type="button" class="bouton-jeu-mat" data-emoji="${e}">${e}</button>`).join("")}</div>
      </div>
    `;
    zoneJeuMaternelle.querySelectorAll(".jeu-mat-colonne:first-child .bouton-jeu-mat").forEach((b) => {
      b.addEventListener("click", () => {
        zoneJeuMaternelle.querySelectorAll(".jeu-mat-colonne:first-child .bouton-jeu-mat").forEach((x) => x.classList.remove("jeu-mat-selectionne"));
        b.classList.add("jeu-mat-selectionne");
        selectionGauche = b.dataset.emoji;
      });
    });
    zoneJeuMaternelle.querySelectorAll(".jeu-mat-colonne:last-child .bouton-jeu-mat").forEach((b) => {
      b.addEventListener("click", () => {
        if (!selectionGauche) return;
        const bonnePaire = paires.find((p) => p[0] === selectionGauche);
        const correct = bonnePaire && bonnePaire[1] === b.dataset.emoji;
        if (correct) {
          trouvees++;
          if (window.speechSynthesis) lireAudioHorsLigne("Bravo !");
          if (trouvees === paires.length) {
            setTimeout(() => feteVictoireMaternelle({ id: "association", titre: "Jeux d'association" }, trouvees, paires.length), 400);
            return;
          }
          // retire la paire trouvée de l'affichage
          const iG = gauche.indexOf(selectionGauche); if (iG > -1) gauche.splice(iG, 1);
          const iD = droite.indexOf(b.dataset.emoji); if (iD > -1) droite.splice(iD, 1);
          selectionGauche = null;
          rendre();
        } else {
          b.classList.add("jeu-mat-incorrect");
          if (window.speechSynthesis) lireAudioHorsLigne("Essaie encore !");
          setTimeout(() => b.classList.remove("jeu-mat-incorrect"), 500);
        }
      });
    });
  };
  rendre();
}

// ---------- 5. Reconnaissance (formes et couleurs) ----------
const FORMES_RECONNAISSANCE = [
  { nom: "carré rouge", emoji: "🟥" }, { nom: "carré bleu", emoji: "🟦" }, { nom: "carré jaune", emoji: "🟨" },
  { nom: "cercle rouge", emoji: "🔴" }, { nom: "cercle bleu", emoji: "🔵" }, { nom: "cercle jaune", emoji: "🟡" },
  { nom: "triangle rouge", emoji: "🔺" }, { nom: "étoile jaune", emoji: "⭐" }, { nom: "cœur rouge", emoji: "❤️" },
];

function lancerJeuReconnaissance() {
  let index = 0, score = 0;
  const rondes = 5;

  const afficher = () => {
    if (index >= rondes) {
      feteVictoireMaternelle({ id: "reconnaissance", titre: "Reconnaissance" }, score, rondes);
      return;
    }
    const choix = melanger(FORMES_RECONNAISSANCE).slice(0, 4);
    const cible = choix[Math.floor(Math.random() * choix.length)];

    zoneJeuMaternelle.innerHTML = `
      <p class="jeu-mat-consigne">Trouve le ${cible.nom} !</p>
      <div class="jeu-mat-score">${index + 1} / ${rondes}</div>
      <div class="jeu-mat-choix">${melanger(choix).map((f) => `<button type="button" class="bouton-jeu-mat" data-nom="${f.nom}" style="font-size:2.2rem;">${f.emoji}</button>`).join("")}</div>
    `;
    zoneJeuMaternelle.querySelectorAll(".bouton-jeu-mat").forEach((bouton) => {
      bouton.addEventListener("click", () => {
        const correct = bouton.dataset.nom === cible.nom;
        bouton.classList.add(correct ? "jeu-mat-correct" : "jeu-mat-incorrect");
        if (correct) score++;
        if (window.speechSynthesis) lireAudioHorsLigne(correct ? "Bravo !" : "Essaie encore !");
        setTimeout(() => { index++; afficher(); }, 700);
      });
    });
  };
  afficher();
}

// ---------- 6. Coloriage (clic pour remplir une zone, façon album à colorier) ----------
const SCENES_COLORIAGE = [
  { nom: "Maison", largeur: 300, hauteur: 260, parties: [
    { id: "ciel", el: "rect", attrs: { x: 0, y: 0, width: 300, height: 260 }, defaut: "#cfe8ff" },
    { id: "soleil", el: "circle", attrs: { cx: 250, cy: 45, r: 28 }, defaut: "#e5e5e5" },
    { id: "toit", el: "polygon", attrs: { points: "40,120 150,40 260,120" }, defaut: "#e5e5e5" },
    { id: "mur", el: "rect", attrs: { x: 60, y: 120, width: 180, height: 120 }, defaut: "#e5e5e5" },
    { id: "porte", el: "rect", attrs: { x: 135, y: 170, width: 40, height: 70 }, defaut: "#e5e5e5" },
    { id: "fenetre", el: "rect", attrs: { x: 80, y: 150, width: 35, height: 35 }, defaut: "#e5e5e5" },
  ]},
  { nom: "Fleur", largeur: 260, hauteur: 220, parties: [
    { id: "tige", el: "rect", attrs: { x: 122, y: 140, width: 16, height: 80 }, defaut: "#e5e5e5" },
    { id: "centre", el: "circle", attrs: { cx: 130, cy: 110, r: 22 }, defaut: "#e5e5e5" },
    { id: "petale1", el: "circle", attrs: { cx: 130, cy: 70, r: 22 }, defaut: "#e5e5e5" },
    { id: "petale2", el: "circle", attrs: { cx: 170, cy: 110, r: 22 }, defaut: "#e5e5e5" },
    { id: "petale3", el: "circle", attrs: { cx: 130, cy: 150, r: 22 }, defaut: "#e5e5e5" },
    { id: "petale4", el: "circle", attrs: { cx: 90, cy: 110, r: 22 }, defaut: "#e5e5e5" },
  ]},
  { nom: "Poisson", largeur: 300, hauteur: 200, parties: [
    { id: "eau", el: "rect", attrs: { x: 0, y: 0, width: 300, height: 200 }, defaut: "#cfe8ff" },
    { id: "corps", el: "ellipse", attrs: { cx: 150, cy: 100, rx: 80, ry: 45 }, defaut: "#e5e5e5" },
    { id: "queue", el: "polygon", attrs: { points: "70,100 20,70 20,130" }, defaut: "#e5e5e5" },
    { id: "nageoire", el: "polygon", attrs: { points: "150,70 170,40 190,75" }, defaut: "#e5e5e5" },
    { id: "oeil", el: "circle", attrs: { cx: 195, cy: 85, r: 8 }, defaut: "#1c2418" },
  ]},
];
const PALETTE_COLORIAGE = ["#d97b8f", "#5b9bd5", "#5fbf8a", "#e8b75c", "#8b6fd8", "#e8734f", "#f2efe2", "#1c2418"];

function lancerJeuColoriage() {
  const scene = SCENES_COLORIAGE[Math.floor(Math.random() * SCENES_COLORIAGE.length)];
  let couleurChoisie = PALETTE_COLORIAGE[0];

  zoneJeuMaternelle.innerHTML = `
    <p class="jeu-mat-consigne">Colorie le dessin : ${scene.nom} !</p>
    <div class="coloriage-palette" id="coloriage-palette">
      ${PALETTE_COLORIAGE.map((c, i) => `<button type="button" class="pastille-couleur ${i === 0 ? "couleur-active" : ""}" data-couleur="${c}" style="background:${c};"></button>`).join("")}
    </div>
    <svg viewBox="0 0 ${scene.largeur} ${scene.hauteur}" class="coloriage-svg" id="coloriage-svg"></svg>
    <button type="button" class="bouton-envoyer bouton-guide" id="btn-fini-coloriage" style="margin-top:16px;">✅ J'ai fini !</button>
  `;

  const svgNS = "http://www.w3.org/2000/svg";
  const svgEl = document.getElementById("coloriage-svg");
  scene.parties.forEach((p) => {
    const el = document.createElementNS(svgNS, p.el);
    Object.entries(p.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.setAttribute("fill", p.defaut);
    el.setAttribute("stroke", "#00000033");
    el.setAttribute("stroke-width", "2");
    el.style.cursor = "pointer";
    el.addEventListener("click", (evenement) => {
      el.setAttribute("fill", couleurChoisie);
      const etincelle = document.createElement("span");
      etincelle.className = "etincelle-coloriage";
      etincelle.textContent = "✨";
      etincelle.style.left = evenement.clientX + "px";
      etincelle.style.top = evenement.clientY + "px";
      document.body.appendChild(etincelle);
      setTimeout(() => etincelle.remove(), 600);
    });
    svgEl.appendChild(el);
  });

  document.querySelectorAll(".pastille-couleur").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      document.querySelectorAll(".pastille-couleur").forEach((b) => b.classList.remove("couleur-active"));
      bouton.classList.add("couleur-active");
      couleurChoisie = bouton.dataset.couleur;
    });
  });

  document.getElementById("btn-fini-coloriage").addEventListener("click", () => {
    feteVictoireMaternelle({ id: "coloriage", titre: "Coloriage" }, 1, 1);
  });
}

// ---------- 7. Puzzle (remettre les pièces dans le bon ordre, par échange) ----------
const SCENES_PUZZLE = [
  ["🌞", "☁️", "🌈", "☁️"],
  ["🐟", "🌊", "🐠", "🌊"],
  ["🌳", "🍎", "🌳", "🍏"],
  ["🚗", "🚦", "🚌", "🚏"],
];

function lancerJeuPuzzle() {
  const cible = SCENES_PUZZLE[Math.floor(Math.random() * SCENES_PUZZLE.length)];
  let etat = melanger(cible);
  while (etat.every((e, i) => e === cible[i])) etat = melanger(cible);
  let premierChoix = null;

  const rendre = () => {
    zoneJeuMaternelle.innerHTML = `
      <p class="jeu-mat-consigne">Remets les pièces comme le modèle !</p>
      <div class="puzzle-modele">${cible.map((e) => `<span>${e}</span>`).join("")}</div>
      <div class="jeu-mat-choix" id="puzzle-tuiles">
        ${etat.map((e, i) => `<button type="button" class="bouton-jeu-mat" data-index="${i}">${e}</button>`).join("")}
      </div>
    `;
    zoneJeuMaternelle.querySelectorAll("#puzzle-tuiles .bouton-jeu-mat").forEach((bouton) => {
      bouton.addEventListener("click", () => {
        const i = Number(bouton.dataset.index);
        if (premierChoix === null) {
          premierChoix = i;
          bouton.classList.add("jeu-mat-selectionne");
        } else if (premierChoix === i) {
          premierChoix = null;
          rendre();
        } else {
          [etat[premierChoix], etat[i]] = [etat[i], etat[premierChoix]];
          premierChoix = null;
          if (etat.every((e, idx) => e === cible[idx])) {
            setTimeout(() => feteVictoireMaternelle({ id: "puzzle", titre: "Puzzle" }, 1, 1), 300);
          } else {
            rendre();
          }
        }
      });
    });
  };
  rendre();
}

// ---------- 8. Labyrinthes (génération réelle, navigation par flèches) ----------
function genererLabyrinthe(taille) {
  const cellules = Array.from({ length: taille }, () =>
    Array.from({ length: taille }, () => ({ N: true, E: true, S: true, O: true, visite: false }))
  );
  const pile = [[0, 0]];
  cellules[0][0].visite = true;
  const dirs = [["N", 0, -1, "S"], ["E", 1, 0, "O"], ["S", 0, 1, "N"], ["O", -1, 0, "E"]];

  while (pile.length) {
    const [x, y] = pile[pile.length - 1];
    const voisins = dirs
      .map(([dir, dx, dy, opp]) => ({ dir, opp, nx: x + dx, ny: y + dy }))
      .filter((v) => v.nx >= 0 && v.nx < taille && v.ny >= 0 && v.ny < taille && !cellules[v.ny][v.nx].visite);
    if (!voisins.length) { pile.pop(); continue; }
    const v = voisins[Math.floor(Math.random() * voisins.length)];
    cellules[y][x][v.dir] = false;
    cellules[v.ny][v.nx][v.opp] = false;
    cellules[v.ny][v.nx].visite = true;
    pile.push([v.nx, v.ny]);
  }
  return cellules;
}

function lancerJeuLabyrinthe() {
  const taille = 6;
  const grille = genererLabyrinthe(taille);
  const joueur = { x: 0, y: 0 };
  const arrivee = { x: taille - 1, y: taille - 1 };

  let cases = "";
  for (let y = 0; y < taille; y++) {
    for (let x = 0; x < taille; x++) {
      const c = grille[y][x];
      const classes = ["labyrinthe-case"];
      if (c.N) classes.push("mur-n");
      if (c.E) classes.push("mur-e");
      if (c.S) classes.push("mur-s");
      if (c.O) classes.push("mur-o");
      const contenu = arrivee.x === x && arrivee.y === y ? "🏁" : "";
      cases += `<div class="${classes.join(" ")}" data-x="${x}" data-y="${y}">${contenu}</div>`;
    }
  }

  zoneJeuMaternelle.innerHTML = `
    <p class="jeu-mat-consigne">Aide 🧒 à trouver la sortie 🏁 !</p>
    <div class="labyrinthe-conteneur">
      <div class="labyrinthe-grille" id="labyrinthe-grille" style="grid-template-columns:repeat(${taille},1fr);">${cases}</div>
      <div class="labyrinthe-joueur" id="labyrinthe-joueur">🧒</div>
    </div>
    <div class="labyrinthe-controles">
      <div></div><button type="button" class="bouton-jeu-mat" data-dir="N">⬆️</button><div></div>
      <button type="button" class="bouton-jeu-mat" data-dir="O">⬅️</button><div></div><button type="button" class="bouton-jeu-mat" data-dir="E">➡️</button>
      <div></div><button type="button" class="bouton-jeu-mat" data-dir="S">⬇️</button><div></div>
    </div>
  `;

  const positionnerJoueur = () => {
    const celluleEl = document.querySelector(`#labyrinthe-grille [data-x="${joueur.x}"][data-y="${joueur.y}"]`);
    const joueurEl = document.getElementById("labyrinthe-joueur");
    if (!celluleEl || !joueurEl) return;
    joueurEl.style.width = celluleEl.offsetWidth + "px";
    joueurEl.style.height = celluleEl.offsetHeight + "px";
    joueurEl.style.left = celluleEl.offsetLeft + "px";
    joueurEl.style.top = celluleEl.offsetTop + "px";
  };
  positionnerJoueur();

  zoneJeuMaternelle.querySelectorAll("[data-dir]").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const dir = bouton.dataset.dir;
      const c = grille[joueur.y][joueur.x];
      if (dir === "N" && !c.N) joueur.y--;
      else if (dir === "S" && !c.S) joueur.y++;
      else if (dir === "E" && !c.E) joueur.x++;
      else if (dir === "O" && !c.O) joueur.x--;
      positionnerJoueur(); // le glissement est animé par la transition CSS
      if (joueur.x === arrivee.x && joueur.y === arrivee.y) {
        setTimeout(() => feteVictoireMaternelle({ id: "labyrinthe", titre: "Labyrinthes" }, 1, 1), 350);
      }
    });
  });
}

// ---------- 9. Compléter l'image (deviner l'élément manquant d'une suite) ----------
const SCENES_COMPLETER = [
  { sequence: ["🍎", "🍌", "❓", "🍇", "🍊"], manquant: "🍓", distracteurs: ["🚗", "⭐", "🐶"] },
  { sequence: ["🔴", "🟡", "❓", "🔴", "🟡"], manquant: "🟢", distracteurs: ["🐱", "📚", "🎈"] },
  { sequence: ["🐱", "🐶", "❓", "🐰", "🐭"], manquant: "🐹", distracteurs: ["🚙", "🍕", "⚽"] },
  { sequence: ["1️⃣", "2️⃣", "❓", "4️⃣", "5️⃣"], manquant: "3️⃣", distracteurs: ["🐸", "🌙", "🎵"] },
];

function lancerJeuCompleter() {
  const scene = SCENES_COMPLETER[Math.floor(Math.random() * SCENES_COMPLETER.length)];
  const choix = melanger([scene.manquant, ...scene.distracteurs]);

  zoneJeuMaternelle.innerHTML = `
    <p class="jeu-mat-consigne">Que manque-t-il pour compléter ?</p>
    <div class="jeu-mat-objets">${scene.sequence.map((e) => `<span>${e}</span>`).join("")}</div>
    <div class="jeu-mat-choix">${choix.map((c) => `<button type="button" class="bouton-jeu-mat" data-val="${c}" style="font-size:2rem;">${c}</button>`).join("")}</div>
  `;
  zoneJeuMaternelle.querySelectorAll(".bouton-jeu-mat").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const correct = bouton.dataset.val === scene.manquant;
      bouton.classList.add(correct ? "jeu-mat-correct" : "jeu-mat-incorrect");
      if (window.speechSynthesis) lireAudioHorsLigne(correct ? "Bravo !" : "Pas tout à fait !");
      setTimeout(() => feteVictoireMaternelle({ id: "completer", titre: "Compléter l'image" }, correct ? 1 : 0, 1), 700);
    });
  });
}

// ---------- 10. Chansons et comptines (comptine ORIGINALE générée par l'IA — jamais
// de vraies paroles existantes reproduites, pour respecter le droit d'auteur) ----------
function lancerJeuChansons() {
  zoneJeuMaternelle.innerHTML = `
    <p class="jeu-mat-consigne">Choisis un thème pour ta comptine !</p>
    <div class="jeu-mat-choix">
      <button type="button" class="bouton-jeu-mat" data-theme="les animaux" style="font-size:1.1rem;">🐾 Animaux</button>
      <button type="button" class="bouton-jeu-mat" data-theme="les couleurs" style="font-size:1.1rem;">🌈 Couleurs</button>
      <button type="button" class="bouton-jeu-mat" data-theme="compter jusqu'à 5" style="font-size:1.1rem;">🔢 Chiffres</button>
    </div>
  `;
  zoneJeuMaternelle.querySelectorAll(".bouton-jeu-mat").forEach((bouton) => {
    bouton.addEventListener("click", () => genererComptine(bouton.dataset.theme));
  });
}

async function genererComptine(theme) {
  zoneJeuMaternelle.innerHTML = `<p class="jeu-mat-consigne">🎵 Ta comptine arrive…</p><p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  const prompt = `Invente une toute petite comptine originale et joyeuse pour un enfant de maternelle, sur le thème "${theme}". ` +
    `4 à 6 lignes courtes et rythmées, simples, en français. Réponds uniquement avec le texte de la comptine, rien d'autre.`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    zoneJeuMaternelle.innerHTML = `
      <p class="jeu-mat-consigne">🎵 Ta comptine</p>
      <div class="comptine-texte">${echapperHtml(data.reponse).replace(/\n/g, "<br>")}</div>
      <button type="button" class="bouton-envoyer bouton-guide" id="btn-ecouter-comptine">🔊 Écouter</button>
      <button type="button" class="bouton-etape-nav" id="btn-fini-comptine" style="margin-left:10px;">✅ Terminé</button>
    `;
    document.getElementById("btn-ecouter-comptine").addEventListener("click", () => lireAudioHorsLigne(data.reponse));
    document.getElementById("btn-fini-comptine").addEventListener("click", () => {
      feteVictoireMaternelle({ id: "chansons", titre: "Chansons et comptines" }, 1, 1);
    });
  } catch (erreur) {
    zoneJeuMaternelle.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

// ============================================================
// MON MAÎTRE : une vraie leçon expliquée par un professeur illustré,
// avatar animé (clignement, "parole" visuelle pendant la lecture audio),
// contrôles audio réels. Honnêteté : même voix pour tous les professeurs
// (un seul moteur TTS disponible), pas de vraie synchronisation labiale.
// ============================================================
const PROFESSEURS_MAITRE = [
  { id: "awa", nom: "Maîtresse Awa", avatar: "👩🏾‍🏫", couleur: "#d97b8f" },
  { id: "oumar", nom: "Maître Oumar", avatar: "👨🏾‍🏫", couleur: "#5b9bd5" },
  { id: "mariam", nom: "Maîtresse Mariam", avatar: "👩🏿‍🏫", couleur: "#5fbf8a" },
];

let professeurChoisi = PROFESSEURS_MAITRE[0];
let audioMaitre = null;

function lancerMonMaitre() {
  zoneJeuMaternelle.innerHTML = `
    <p class="jeu-mat-consigne">👨‍🏫 Choisis ton maître</p>
    <p class="guide-desc" style="text-align:center;">Tous les maîtres ont la même voix pour l'instant — seul le personnage change.</p>
    <div class="jeu-mat-choix" id="choix-professeur">
      ${PROFESSEURS_MAITRE.map((p) => `
        <button type="button" class="carte-professeur" data-prof="${p.id}" style="border-color:${p.couleur};">
          <span style="font-size:2.2rem;">${p.avatar}</span>
          <span>${p.nom}</span>
        </button>
      `).join("")}
    </div>
  `;
  zoneJeuMaternelle.querySelectorAll(".carte-professeur").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      professeurChoisi = PROFESSEURS_MAITRE.find((p) => p.id === bouton.dataset.prof);
      afficherSalleDeClasse();
    });
  });
}

function afficherSalleDeClasse() {
  zoneJeuMaternelle.innerHTML = `
    <div class="salle-classe">
      <div class="avatar-maitre-zone">
        <div class="avatar-maitre" id="avatar-maitre" style="background:${professeurChoisi.couleur}33;">
          <span class="avatar-maitre-visage" id="avatar-visage">${professeurChoisi.avatar}</span>
          <span class="baton-maitre" id="baton-maitre">📏</span>
        </div>
        <p class="avatar-maitre-nom">${professeurChoisi.nom}</p>
      </div>
      <div class="tableau-maitre">
        <div class="etude-champ">
          <label>Que veux-tu apprendre aujourd'hui ?</label>
          <input type="text" id="sujet-maitre-input" placeholder="Ex : les couleurs, compter jusqu'à 10, les animaux…">
        </div>
        <button type="button" class="bouton-envoyer bouton-guide" id="btn-demarrer-cours-maitre">▶ Commencer le cours</button>
        <div id="tableau-maitre-contenu"></div>
      </div>
    </div>
  `;
  document.getElementById("btn-demarrer-cours-maitre").addEventListener("click", () => {
    const sujet = document.getElementById("sujet-maitre-input").value.trim();
    if (!sujet) { alert("Dis à ton maître ce que tu veux apprendre !"); return; }
    demarrerCoursMaitre(sujet);
  });
}

async function demarrerCoursMaitre(sujet) {
  const contenu = document.getElementById("tableau-maitre-contenu");
  contenu.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const prompt = `Tu es un enseignant chaleureux pour un enfant de maternelle. Explique "${sujet}" de façon très simple et joyeuse, ` +
    `4 à 5 phrases courtes maximum, comme si tu parlais à voix haute à l'enfant, avec des encouragements.`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    contenu.innerHTML = `
      <div class="tableau-texte">${echapperHtml(data.reponse)}</div>
      <div class="maitre-controles">
        <button type="button" class="bouton-jeu-mat" id="btn-play-maitre" title="Lire">▶️</button>
        <button type="button" class="bouton-jeu-mat" id="btn-pause-maitre" title="Pause">⏸️</button>
        <button type="button" class="bouton-jeu-mat" id="btn-rejouer-maitre" title="Rejouer">🔁</button>
        <button type="button" class="bouton-jeu-mat" id="btn-lent-maitre" title="Plus lentement">🐢</button>
      </div>
      <div class="maitre-actions">
        <button type="button" class="bouton-etape-nav" id="btn-resume-maitre">📖 Résumé</button>
        <button type="button" class="bouton-etape-nav" id="btn-exercice-maitre">📝 Exercice</button>
        <button type="button" class="bouton-etape-nav" id="btn-test-maitre">🏆 Test final</button>
      </div>
    `;
    lancerLectureMaitre(data.reponse);
    brancherControlesMaitre(sujet);
  } catch (erreur) {
    contenu.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

async function lancerLectureMaitre(texte) {
  const avatarEl = document.getElementById("avatar-maitre");
  if (selecteurLangue.value === "moore") return; // pas de voix disponible pour le mooré
  try {
    const res = await fetch("/api/parler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texte, langue: selecteurLangue.value }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    audioMaitre = new Audio(URL.createObjectURL(blob));
    audioMaitre.onplay = () => avatarEl && avatarEl.classList.add("parle");
    audioMaitre.onpause = () => avatarEl && avatarEl.classList.remove("parle");
    audioMaitre.onended = () => avatarEl && avatarEl.classList.remove("parle");
    audioMaitre.play();
  } catch {
    // lecture audio best-effort : le texte reste lisible même en cas d'échec
  }
}

function brancherControlesMaitre(sujet) {
  document.getElementById("btn-play-maitre").addEventListener("click", () => audioMaitre && audioMaitre.play());
  document.getElementById("btn-pause-maitre").addEventListener("click", () => audioMaitre && audioMaitre.pause());
  document.getElementById("btn-rejouer-maitre").addEventListener("click", () => {
    if (!audioMaitre) return;
    audioMaitre.currentTime = 0;
    audioMaitre.play();
  });
  document.getElementById("btn-lent-maitre").addEventListener("click", (e) => {
    if (!audioMaitre) return;
    audioMaitre.playbackRate = audioMaitre.playbackRate < 1 ? 1 : 0.6;
    e.currentTarget.style.opacity = audioMaitre.playbackRate < 1 ? "1" : "0.6";
  });
  document.getElementById("btn-resume-maitre").addEventListener("click", () => genererResumeMaitre(sujet));
  document.getElementById("btn-exercice-maitre").addEventListener("click", () => {
    if (audioMaitre) audioMaitre.pause();
    rendreGrilleJeuxMaternelle(); // renvoie vers un vrai jeu pour s'exercer
  });
  document.getElementById("btn-test-maitre").addEventListener("click", () => lancerTestFinalMaitre(sujet));
}

async function genererResumeMaitre(sujet) {
  const contenu = document.getElementById("tableau-maitre-contenu");
  const zoneTexte = contenu.querySelector(".tableau-texte");
  zoneTexte.innerHTML = texteTraduit("reflexion");
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: `Résume "${sujet}" en une seule phrase très simple pour un enfant de maternelle.`, historique: [], langue: selecteurLangue.value }),
    });
    const data = await res.json();
    zoneTexte.innerHTML = echapperHtml(data.reponse);
    lancerLectureMaitre(data.reponse);
  } catch {
    zoneTexte.textContent = "⚠️ Résumé indisponible.";
  }
}

async function lancerTestFinalMaitre(sujet) {
  const contenu = document.getElementById("tableau-maitre-contenu");
  contenu.innerHTML = `<p class="chargement-guide">${texteTraduit("jeuxPreparation")}</p>`;
  const prompt = `Génère exactement 3 questions à choix multiples très simples pour un enfant de maternelle sur le sujet "${sujet}". ` +
    `Réponds UNIQUEMENT avec un tableau JSON valide : [{"question": "...", "choix": ["...","...","...","..."], "reponse": 0}]`;
  try {
    const questions = await demanderTableauJSON(prompt, selecteurLangue.value);
    let index = 0, score = 0;
    const afficherQ = () => {
      const q = questions[index];
      contenu.innerHTML = `
        <div class="jeu-progression">${index + 1} / ${questions.length}</div>
        <div class="jeu-question">${echapperHtml(q.question)}</div>
        <div class="jeu-choix">${q.choix.map((c, i) => `<button type="button" class="bouton-choix" data-index="${i}">${echapperHtml(c)}</button>`).join("")}</div>
      `;
      contenu.querySelectorAll(".bouton-choix").forEach((bouton) => {
        bouton.addEventListener("click", () => {
          const choisi = Number(bouton.dataset.index);
          contenu.querySelectorAll(".bouton-choix").forEach((b) => (b.disabled = true));
          if (choisi === Number(q.reponse)) { bouton.classList.add("bonne-reponse"); score++; }
          else {
            bouton.classList.add("mauvaise-reponse");
            contenu.querySelectorAll(".bouton-choix")[q.reponse].classList.add("bonne-reponse");
          }
          const suite = document.createElement("button");
          suite.type = "button";
          suite.className = "bouton-envoyer jeu-suivant";
          suite.textContent = index + 1 < questions.length ? texteTraduit("jeuxSuivant") : texteTraduit("jeuxTermine");
          suite.addEventListener("click", () => {
            index++;
            if (index < questions.length) afficherQ();
            else {
              contenu.innerHTML = `<p>🎉 ${texteTraduit("jeuxScoreTexte").replace("{score}", score).replace("{total}", questions.length)}</p>`;
              enregistrerActivite("jeu", "Maternelle", `${professeurChoisi.nom} — ${sujet}`, score, questions.length);
            }
          });
          contenu.appendChild(suite);
        });
      });
    };
    afficherQ();
  } catch {
    contenu.innerHTML = `<p>⚠️ ${texteTraduit("jeuxErreur")}</p>`;
  }
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
  document.getElementById("concours-quiz-zone").hidden = true;
  document.getElementById("concours-quiz-zone").innerHTML = "";

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
  const categorie = partageConcoursCategorie.value;
  const fichiers = partageConcoursFichier.files;
  const zoneStatut = document.getElementById("statut-envoi-concours");

  if (!fichiers.length) {
    alert("Choisis au moins un fichier avant d'envoyer.");
    return;
  }
  btnValiderPartageConcours.disabled = true;
  btnValiderPartageConcours.textContent = "Envoi en cours…";

  await envoyerDocumentsEnLot(fichiers, categorie, concoursActuel, zoneStatut, () => {
    chargerDocumentsPourConcours(concoursActuel);
  });

  partageConcoursFichier.value = "";
  btnValiderPartageConcours.disabled = false;
  btnValiderPartageConcours.textContent = "Envoyer";
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
    enregistrerActivite("concours", nomConcours, infos.organisme);
  } catch (erreur) {
    concoursResultatDetail.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

// ---------- QCM d'entraînement sur la page dédiée à un concours ----------
document.getElementById("btn-lancer-quiz-concours").addEventListener("click", async () => {
  const zone = document.getElementById("concours-quiz-zone");
  const infos = LISTE_CONCOURS.find((c) => c.nom === concoursActuel);
  zone.hidden = false;
  zone.innerHTML = `<p class="chargement-guide">${texteTraduit("jeuxPreparation")}</p>`;

  const prompt = `Génère exactement 4 questions à choix multiples typiques du concours "${concoursActuel}" ` +
    `(${infos.organisme}, niveau ${infos.niveau}, catégorie ${infos.categorie}, Burkina Faso), portant sur les matières habituellement testées. ` +
    `Réponds UNIQUEMENT avec un tableau JSON valide au format : [{"question": "...", "choix": ["...", "...", "...", "..."], "reponse": 0}]`;

  try {
    const questions = await demanderTableauJSON(prompt, selecteurLangue.value);
    let index = 0;
    let score = 0;

    const afficherQ = () => {
      const q = questions[index];
      zone.innerHTML = `
        <div class="jeu-progression">${index + 1} / ${questions.length}</div>
        <div class="jeu-question">${echapperHtml(q.question)}</div>
        <div class="jeu-choix">
          ${q.choix.map((c, i) => `<button type="button" class="bouton-choix" data-index="${i}">${echapperHtml(c)}</button>`).join("")}
        </div>
      `;
      rendreMaths(zone);
      zone.querySelectorAll(".bouton-choix").forEach((bouton) => {
        bouton.addEventListener("click", () => {
          const choisi = Number(bouton.dataset.index);
          zone.querySelectorAll(".bouton-choix").forEach((b) => (b.disabled = true));
          if (choisi === Number(q.reponse)) {
            bouton.classList.add("bonne-reponse");
            score++;
          } else {
            bouton.classList.add("mauvaise-reponse");
            zone.querySelectorAll(".bouton-choix")[q.reponse].classList.add("bonne-reponse");
          }
          const suite = document.createElement("button");
          suite.type = "button";
          suite.className = "bouton-envoyer jeu-suivant";
          suite.textContent = index + 1 < questions.length ? texteTraduit("jeuxSuivant") : texteTraduit("jeuxTermine");
          suite.addEventListener("click", () => {
            index++;
            if (index < questions.length) {
              afficherQ();
            } else {
              zone.innerHTML = `<p>🎉 ${texteTraduit("jeuxScoreTexte").replace("{score}", score).replace("{total}", questions.length)}</p>`;
              enregistrerActivite("quiz", concoursActuel, "QCM concours", score, questions.length);
            }
          });
          zone.appendChild(suite);
        });
      });
    };
    afficherQ();
  } catch {
    zone.innerHTML = `<p>⚠️ ${texteTraduit("jeuxErreur")}</p>`;
  }
});

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
let suiviDocument = { resume: false, quiz: false, fiches: false, exercices: false };

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
    suiviDocument = { resume: false, quiz: false, fiches: false, exercices: false };
    mettreAJourSuiviDocument();
    genererApercuDocument();
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
      expliquer: "Réécris les notions les plus difficiles de ce document avec des mots simples et des exemples concrets, comme si tu expliquais à un élève qui découvre le sujet.",
      exercices: "Propose 3 exercices d'entraînement corrigés à partir de ce document (énoncé puis corrigé détaillé), avec un retour à la ligne entre chaque partie.",
      memorisation: "Propose 3 à 4 techniques concrètes de mémorisation à long terme (associations, acronymes, méthode des loci...) pour retenir les notions clés de ce document, avec un exemple appliqué pour chacune.",
    };

    if (action === "quiz") {
      genererQuizDocument();
      suiviDocument.quiz = true;
    } else if (action === "cartementale") {
      genererCarteMentaleDocument();
    } else if (action === "fiche") {
      genererFichesDocument();
      suiviDocument.fiches = true;
    } else {
      interrogerDocument(consignes[action]);
      if (action === "resumer") suiviDocument.resume = true;
      if (action === "exercices") suiviDocument.exercices = true;
    }
    mettreAJourSuiviDocument();
  });
});

function mettreAJourSuiviDocument() {
  const suivi = document.getElementById("biblio-suivi");
  const liste = document.getElementById("biblio-suivi-liste");
  if (!documentImporte) { suivi.hidden = true; return; }
  suivi.hidden = false;
  const items = [
    ["resume", "📘 Résumé consulté"],
    ["quiz", "✅ Quiz fait"],
    ["fiches", "📇 Fiches créées"],
    ["exercices", "✏️ Exercices faits"],
  ];
  liste.innerHTML = items.map(([cle, libelle]) =>
    `<span class="suivi-item ${suiviDocument[cle] ? "fait" : ""}">${suiviDocument[cle] ? "✅" : "⬜"} ${libelle}</span>`
  ).join("");
}

async function genererApercuDocument() {
  const apercu = document.getElementById("biblio-apercu");
  const contenu = document.getElementById("biblio-apercu-contenu");
  apercu.hidden = false;
  contenu.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  const prompt = `Voici le contenu d'un document :\n\n"""${documentImporte.texte}"""\n\n` +
    `Analyse-le et réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format : ` +
    `{"chapitres": ["titre du chapitre/section 1", "..."], "resume_points": ["point clé 1", "point clé 2", "point clé 3"], "concepts": ["concept 1", "concept 2", "..."]}`;

  try {
    const donnees = await demanderObjetJSON(prompt, selecteurLangue.value);
    contenu.innerHTML = `
      <div class="apercu-grille">
        <div class="apercu-bloc">
          <h4>📑 Chapitres détectés</h4>
          <ul>${(donnees.chapitres || []).map((c) => `<li>${echapperHtml(c)}</li>`).join("")}</ul>
        </div>
        <div class="apercu-bloc">
          <h4>🔑 Points clés</h4>
          <ul>${(donnees.resume_points || []).map((c) => `<li>${echapperHtml(c)}</li>`).join("")}</ul>
        </div>
        <div class="apercu-bloc">
          <h4>🏷️ Concepts importants</h4>
          <div class="apercu-tags">${(donnees.concepts || []).map((c) => `<span class="apercu-tag">${echapperHtml(c)}</span>`).join("")}</div>
        </div>
      </div>
    `;
  } catch {
    apercu.hidden = true; // aperçu optionnel : on n'affiche rien plutôt qu'une erreur intrusive
  }
}

async function genererCarteMentaleDocument() {
  biblioResultat.hidden = false;
  biblioResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  const prompt = `Voici le contenu d'un document :\n\n"""${documentImporte.texte}"""\n\n` +
    `Crée une carte mentale de ce document. Réponds UNIQUEMENT avec un objet JSON valide : ` +
    `{"centre": "titre très court du document", "branches": [{"titre": "...", "points": ["...", "..."]}]} avec 4 à 6 branches.`;
  try {
    const donnees = await demanderObjetJSON(prompt, selecteurLangue.value);
    biblioResultat.innerHTML = construireCarteMentaleSVG(donnees);
  } catch {
    biblioResultat.innerHTML = `<p>⚠️ ${texteTraduit("jeuxErreur")}</p>`;
  }
}

async function genererFichesDocument() {
  biblioResultat.hidden = false;
  if (!localStorage.getItem("inous_jeton")) {
    biblioResultat.innerHTML = `<p>Connecte-toi pour créer des fiches de révision à partir de ce document.</p>`;
    return;
  }
  biblioResultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetchAuthentifie("/api/fiches/generer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere: documentImporte.nom, classe: "", sujet: documentImporte.nom, texte_source: documentImporte.texte }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    biblioResultat.innerHTML = `<p>✅ ${data.length} fiches créées à partir de ce document !</p><p class="guide-desc">Retrouve-les dans Étudier avec moi → une classe → onglet 📇 Fiches (matière : "${echapperHtml(documentImporte.nom)}").</p>`;
  } catch (erreur) {
    biblioResultat.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}


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
            else {
              biblioResultat.innerHTML = `<p>🎉 ${texteTraduit("jeuxScoreTexte").replace("{score}", score).replace("{total}", questions.length)}</p>`;
              enregistrerActivite("quiz_document", documentImporte ? documentImporte.nom : "Document", null, score, questions.length);
            }
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
  const categorie = partageCategorie.value;
  const fichiers = partageFichier.files;
  const zoneStatut = document.getElementById("statut-envoi-biblio");

  if (!fichiers.length) {
    alert("Choisis au moins un fichier avant d'envoyer.");
    return;
  }
  btnValiderPartage.disabled = true;
  btnValiderPartage.textContent = "Envoi en cours…";

  await envoyerDocumentsEnLot(fichiers, categorie, null, zoneStatut, () => {
    chargerDocumentsPartages();
  });

  partageFichier.value = "";
  btnValiderPartage.disabled = false;
  btnValiderPartage.textContent = "Envoyer";
});

chargerDocumentsPartages();

// ============================================================
// MON PROFIL : historique réel d'apprentissage (points, série, séances)
// ============================================================
const COULEURS_MATIERE = ["#5fbf8a", "#5b9bd5", "#8b6fd8", "#e8b75c", "#d97b6c"];
const LIBELLES_TYPE_ACTIVITE = {
  cours: "Cours", quiz: "Quiz", jeu: "Jeu", quiz_document: "Quiz document", concours: "Préparation concours",
};

// enregistre discrètement une activité terminée — jamais bloquant pour
// l'utilisateur : si ça échoue (pas connecté, réseau...), on l'ignore
async function enregistrerActivite(typeActivite, matiere, sujet, score, total, classe) {
  if (!localStorage.getItem("inous_jeton")) return;
  try {
    await fetchAuthentifie("/api/profil/activite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type_activite: typeActivite, matiere, sujet, score, total, classe: classe || null }),
    });
  } catch {
    // best-effort, silencieux
  }
}

async function chargerMonProfil() {
  const jeton = localStorage.getItem("inous_jeton");
  const email = localStorage.getItem("inous_email");
  document.getElementById("profil-non-connecte").hidden = !!jeton;
  document.getElementById("profil-connecte").hidden = !jeton;
  if (!jeton) return;

  document.getElementById("profil-avatar-lettres").textContent = email.slice(0, 2).toUpperCase();
  document.getElementById("profil-email-texte").textContent = email;

  const conteneurStats = document.getElementById("profil-stats");
  conteneurStats.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;

  try {
    const res = await fetchAuthentifie("/api/profil/historique");
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    const resProfil = await fetchAuthentifie("/api/profil");
    const profil = resProfil.ok ? await resProfil.json() : { points: 0, serie_actuelle: 0 };

    let rappelFiches = 0;
    try {
      const resFiches = await fetchAuthentifie("/api/fiches/a-reviser?matiere=&classe=");
      if (resFiches.ok) rappelFiches = (await resFiches.json()).length;
    } catch { /* pas grave si indisponible */ }

    conteneurStats.innerHTML = `
      <div class="profil-stat-carte"><div class="profil-stat-icone">🔥</div><div class="profil-stat-valeur">${profil.serie_actuelle || 0}</div><div class="profil-stat-label">jours de suite</div></div>
      <div class="profil-stat-carte"><div class="profil-stat-icone">⭐</div><div class="profil-stat-valeur">${profil.points || 0}</div><div class="profil-stat-label">points</div></div>
      <div class="profil-stat-carte"><div class="profil-stat-icone">📚</div><div class="profil-stat-valeur">${data.stats.seances}</div><div class="profil-stat-label">séances</div></div>
      <div class="profil-stat-carte"><div class="profil-stat-icone">🎯</div><div class="profil-stat-valeur">${data.stats.score_moyen !== null ? data.stats.score_moyen + "%" : "—"}</div><div class="profil-stat-label">score moyen quiz</div></div>
    `;
    if (rappelFiches > 0) {
      conteneurStats.innerHTML += `<div class="rappel-fiches">🔔 ${rappelFiches} fiche${rappelFiches > 1 ? "s" : ""} à réviser aujourd'hui — va dans Étudier avec moi → une classe → onglet 📇 Fiches</div>`;
    }

    chargerBadges();
    chargerClassement();
    document.getElementById("btn-telecharger-historique-pdf").onclick = telechargerHistoriquePDF;
    document.getElementById("btn-telecharger-historique-csv").onclick = telechargerHistoriqueCSV;

    const matieres = Object.entries(data.stats.matieres).sort((a, b) => b[1] - a[1]);
    const maxCompte = matieres.length ? matieres[0][1] : 1;
    document.getElementById("profil-matieres").innerHTML = matieres.length
      ? matieres.map(([nom, compte], i) => `
          <div class="profil-matiere-ligne">
            <span class="profil-matiere-nom">${echapperHtml(nom)}</span>
            <div class="profil-matiere-barre"><div class="profil-matiere-remplie" style="width:${Math.round((compte / maxCompte) * 100)}%;background:${COULEURS_MATIERE[i % COULEURS_MATIERE.length]};"></div></div>
            <span class="profil-matiere-compte">${compte} séance${compte > 1 ? "s" : ""}</span>
          </div>`).join("")
      : `<p class="chargement-guide">Aucune activité pour l'instant — commence une séance dans "Étudier avec moi" !</p>`;

    document.getElementById("profil-historique").innerHTML = data.historique.length
      ? data.historique.map((h) => {
          const badge = h.total
            ? `<span class="histo-badge" style="background:rgba(95,191,138,0.16);color:#5fbf8a;">${h.score}/${h.total}</span>`
            : `<span class="histo-badge" style="background:rgba(91,155,213,0.16);color:#5b9bd5;">terminé</span>`;
          const date = new Date(h.date_activite).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
          return `
            <div class="profil-ligne-histo">
              <div>
                <div class="histo-titre">${echapperHtml(h.matiere || "")}${h.sujet ? " — " + echapperHtml(h.sujet) : ""}</div>
                <div class="histo-meta">${LIBELLES_TYPE_ACTIVITE[h.type_activite] || h.type_activite} · ${date}</div>
              </div>
              ${badge}
            </div>`;
        }).join("")
      : `<p class="chargement-guide">Rien à afficher pour l'instant.</p>`;
  } catch (erreur) {
    conteneurStats.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

async function chargerBadges() {
  const grille = document.getElementById("grille-badges");
  try {
    const res = await fetchAuthentifie("/api/profil/badges");
    const badges = await res.json();
    grille.innerHTML = badges.map((b) => `
      <div class="carte-badge ${b.obtenu ? "obtenu" : "verrouille"}" title="${echapperHtml(b.desc)}">
        <span class="badge-icone">${b.obtenu ? b.icone : "🔒"}</span>
        <span class="badge-titre">${echapperHtml(b.titre)}</span>
      </div>`).join("");
  } catch {
    grille.innerHTML = `<p class="chargement-guide">Badges indisponibles pour l'instant.</p>`;
  }
}

async function chargerClassement() {
  const resultat = document.getElementById("classement-resultat");
  const classeInput = document.getElementById("classement-classe-input");
  const toggle = document.getElementById("classement-visible-toggle");

  document.getElementById("btn-enregistrer-classement").onclick = async () => {
    const classe = classeInput.value.trim();
    if (!classe) { alert("Indique ta classe."); return; }
    try {
      await fetchAuthentifie("/api/profil/classement-parametres", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classe, visible: toggle.checked }),
      });
      afficherClassement(classe);
    } catch { /* silencieux */ }
  };

  const classeSauvee = classeInput.value.trim();
  if (classeSauvee) afficherClassement(classeSauvee);
}

async function afficherClassement(classe) {
  const resultat = document.getElementById("classement-resultat");
  resultat.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetchAuthentifie(`/api/classement?classe=${encodeURIComponent(classe)}`);
    const data = await res.json();
    if (!data.classement.length) {
      resultat.innerHTML = `<p class="chargement-guide">Personne d'autre n'a encore rejoint le classement pour "${echapperHtml(classe)}".</p>`;
      return;
    }
    resultat.innerHTML = `<div class="liste-ressources">${data.classement.map((c) => `
      <div class="carte-ressource ${c.toi ? "classement-toi" : ""}">
        <div class="carte-ressource-titre">#${c.rang} ${c.toi ? "— Toi" : ""}</div>
        <div>⭐ ${c.points} pts · 🔥 ${c.serie}j</div>
      </div>`).join("")}</div>`;
  } catch {
    resultat.innerHTML = "";
  }
}

// ---------- Calendrier scolaire (dates officielles confirmées) ----------
const DATES_CALENDRIER_BF = [
  { date: "8 septembre 2025", titre: "Rentrée des classes", desc: "Année scolaire 2025-2026" },
  { date: "15 juin — 15 juillet 2026", titre: "Mois Artistique et Culturel (MAC)", desc: "Activités culturelles et sportives scolaires" },
  { date: "15 juillet 2026", titre: "Fin officielle des cours", desc: "Arrêté conjoint du 13 mars 2026" },
];

// ---------- Recherche globale (concours + documents bibliothèque) ----------
const rechercheGlobaleInput = document.getElementById("recherche-globale-input");
const rechercheGlobaleResultats = document.getElementById("recherche-globale-resultats");
let delaiRechercheGlobale = null;

rechercheGlobaleInput.addEventListener("input", () => {
  clearTimeout(delaiRechercheGlobale);
  const terme = rechercheGlobaleInput.value.trim().toLowerCase();
  if (terme.length < 2) { rechercheGlobaleResultats.hidden = true; return; }
  delaiRechercheGlobale = setTimeout(() => lancerRechercheGlobale(terme), 300);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".recherche-globale")) rechercheGlobaleResultats.hidden = true;
});

async function lancerRechercheGlobale(terme) {
  const resultats = [];

  LISTE_CONCOURS.filter((c) => c.nom.toLowerCase().includes(terme) || c.organisme.toLowerCase().includes(terme))
    .slice(0, 5)
    .forEach((c) => resultats.push({ type: "Concours", label: `${c.nom} — ${c.organisme}`, action: () => { document.querySelector('[data-mode="concours"]').click(); setTimeout(() => ouvrirPageConcours(c.nom), 200); } }));

  try {
    const res = await fetch(`/api/bibliotheque/documents?categorie=Tous`);
    const docs = await res.json();
    docs.filter((d) => d.nom.toLowerCase().includes(terme)).slice(0, 5)
      .forEach((d) => resultats.push({ type: "Document", label: d.nom, action: () => window.open(d.url_fichier, "_blank") }));
  } catch { /* pas grave si indisponible */ }

  rechercheGlobaleResultats.hidden = false;
  rechercheGlobaleResultats.innerHTML = resultats.length
    ? resultats.map((r, i) => `<button type="button" class="recherche-resultat-item" data-i="${i}"><span class="recherche-resultat-type">${r.type}</span>${echapperHtml(r.label)}</button>`).join("")
    : `<div class="recherche-resultat-item">Aucun résultat.</div>`;
  rechercheGlobaleResultats.querySelectorAll(".recherche-resultat-item[data-i]").forEach((bouton) => {
    bouton.addEventListener("click", () => { resultats[Number(bouton.dataset.i)].action(); rechercheGlobaleResultats.hidden = true; rechercheGlobaleInput.value = ""; });
  });
}

// ---------- Accessibilité (persistée) ----------
function appliquerParametresAccessibilite() {
  const taille = localStorage.getItem("inous_taille_texte") || "normal";
  document.body.classList.remove("taille-grand", "taille-tres-grand");
  if (taille !== "normal") document.body.classList.add(`taille-${taille}`);
  document.querySelectorAll(".access-btn").forEach((b) => b.classList.toggle("actif", b.dataset.taille === taille));

  document.body.classList.toggle("contraste-renforce", localStorage.getItem("inous_contraste") === "1");
  document.getElementById("toggle-contraste").checked = localStorage.getItem("inous_contraste") === "1";
  document.body.classList.toggle("police-lisible", localStorage.getItem("inous_police_lisible") === "1");
  document.getElementById("toggle-police-lisible").checked = localStorage.getItem("inous_police_lisible") === "1";
}

document.querySelectorAll(".access-btn").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    localStorage.setItem("inous_taille_texte", bouton.dataset.taille);
    appliquerParametresAccessibilite();
  });
});
document.getElementById("toggle-contraste").addEventListener("change", (e) => {
  localStorage.setItem("inous_contraste", e.target.checked ? "1" : "0");
  appliquerParametresAccessibilite();
});
document.getElementById("toggle-police-lisible").addEventListener("change", (e) => {
  localStorage.setItem("inous_police_lisible", e.target.checked ? "1" : "0");
  appliquerParametresAccessibilite();
});
appliquerParametresAccessibilite();

// ---------- Notifications push réelles ----------
// ---------- Enregistrement du service worker (PWA installable + push réel) ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((e) => console.warn("SW non enregistré :", e));
  });
}

function base64UrlVersUint8(base64Url) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(base64);
  return Uint8Array.from([...brut].map((c) => c.charCodeAt(0)));
}

document.getElementById("btn-activer-notifications").addEventListener("click", async () => {
  const statut = document.getElementById("notifications-statut");
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    statut.textContent = "⚠️ Non supporté par ce navigateur.";
    return;
  }
  if (!localStorage.getItem("inous_jeton")) {
    statut.textContent = "⚠️ Connecte-toi d'abord.";
    return;
  }
  statut.textContent = "Activation…";
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { statut.textContent = "⚠️ Permission refusée."; return; }

    const resCle = await fetch("/api/notifications/cle-publique");
    const { cle_publique } = await resCle.json();
    if (!cle_publique) { statut.textContent = "⚠️ Notifications non configurées côté serveur."; return; }

    const enregistrement = await navigator.serviceWorker.ready;
    const abonnement = await enregistrement.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlVersUint8(cle_publique),
    });

    await fetchAuthentifie("/api/notifications/abonnement", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ abonnement: abonnement.toJSON() }),
    });
    statut.textContent = "✅ Rappels activés !";
  } catch (erreur) {
    statut.textContent = "⚠️ " + erreur.message;
  }
});

// ---------- Devoirs (élève : liste par classe) ----------
async function chargerDevoirsEleve() {
  const liste = document.getElementById("liste-devoirs-eleve");
  const classe = classeChoisie || etudeNiveauChoisi;
  if (!classe) { liste.innerHTML = `<p class="chargement-guide">Choisis d'abord ta classe.</p>`; return; }
  liste.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetchAuthentifie(`/api/devoirs/classe?classe=${encodeURIComponent(classe)}`);
    const devoirs = await res.json();
    liste.innerHTML = devoirs.length
      ? devoirs.map((d) => `
          <div class="carte-ressource">
            <div>
              <div class="carte-ressource-titre">${d.fait ? "✅" : "⬜"} ${echapperHtml(d.matiere)} — ${echapperHtml(d.question)}</div>
              <div class="carte-ressource-meta">À rendre avant le ${d.date_limite}</div>
            </div>
            ${!d.fait ? `<button type="button" class="bouton-etape-nav" data-id="${d.id}">Faire</button>` : ""}
          </div>`).join("")
      : `<p class="chargement-guide">Aucun devoir assigné pour cette classe.</p>`;

    liste.querySelectorAll("[data-id]").forEach((bouton) => {
      bouton.addEventListener("click", () => faireDevoir(devoirs.find((d) => d.id === bouton.dataset.id), liste));
    });
  } catch (erreur) {
    liste.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
}

function faireDevoir(devoir, liste) {
  liste.innerHTML = `
    <div class="jeu-question">${echapperHtml(devoir.question)}</div>
    <div class="jeu-choix">${devoir.choix.map((c, i) => `<button type="button" class="bouton-choix" data-index="${i}">${echapperHtml(c)}</button>`).join("")}</div>
  `;
  liste.querySelectorAll(".bouton-choix").forEach((bouton) => {
    bouton.addEventListener("click", async () => {
      const choisi = Number(bouton.dataset.index);
      const correct = choisi === Number(devoir.reponse_index);
      liste.querySelectorAll(".bouton-choix").forEach((b) => (b.disabled = true));
      bouton.classList.add(correct ? "bonne-reponse" : "mauvaise-reponse");
      await fetchAuthentifie(`/api/devoirs/${devoir.id}/fait`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: correct ? 1 : 0, total: 1 }),
      });
      enregistrerActivite("quiz", devoir.matiere, "Devoir", correct ? 1 : 0, 1, devoir.classe);
      setTimeout(() => chargerDevoirsEleve(), 1200);
    });
  });
}

// ---------- Export PDF / téléchargement historique ----------
function telechargerPDF(titre, texte) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titre, 10, 15);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(texte, 190), 10, 25);
  doc.save(`${titre.replace(/[^a-z0-9]/gi, "_")}.pdf`);
}

async function telechargerHistoriquePDF() {
  const res = await fetchAuthentifie("/api/profil/historique");
  const data = await res.json();
  const texte = data.historique.map((h) =>
    `${h.date_activite?.slice(0, 10)} — ${h.matiere || ""} ${h.sujet ? "— " + h.sujet : ""} (${h.type_activite})${h.total ? ` : ${h.score}/${h.total}` : ""}`
  ).join("\n");
  telechargerPDF("Mon historique INO-Education", texte || "Aucune activité enregistrée.");
}

function telechargerHistoriqueCSV() {
  fetchAuthentifie("/api/profil/historique").then((res) => res.json()).then((data) => {
    const lignes = ["Date,Matiere,Sujet,Type,Score,Total"];
    data.historique.forEach((h) => {
      lignes.push([h.date_activite?.slice(0, 10), h.matiere || "", h.sujet || "", h.type_activite, h.score ?? "", h.total ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
    const blob = new Blob([lignes.join("\n")], { type: "text/csv" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "historique_ino-education.csv";
    lien.click();
  });
}

function chargerCalendrier() {
  document.getElementById("liste-calendrier").innerHTML = DATES_CALENDRIER_BF.map((d) => `
    <div class="carte-ressource">
      <div>
        <div class="carte-ressource-titre">📅 ${echapperHtml(d.date)}</div>
        <div class="carte-ressource-meta">${echapperHtml(d.titre)} — ${echapperHtml(d.desc)}</div>
      </div>
    </div>`).join("");
}

// ---------- Espace enseignant (statistiques réelles de ses propres ressources) ----------
async function chargerEspaceEnseignant() {
  const jeton = localStorage.getItem("inous_jeton");
  document.getElementById("enseignant-non-connecte").hidden = !!jeton;
  document.getElementById("enseignant-connecte").hidden = !jeton;
  if (!jeton) return;

  const stats = document.getElementById("enseignant-stats");
  stats.innerHTML = `<p class="chargement-guide">${texteTraduit("reflexion")}</p>`;
  try {
    const res = await fetchAuthentifie("/api/enseignant/stats");
    const data = await res.json();
    stats.innerHTML = `
      <div class="profil-stat-carte"><div class="profil-stat-icone">🎥</div><div class="profil-stat-valeur">${data.total_videos}</div><div class="profil-stat-label">vidéos ajoutées</div></div>
      <div class="profil-stat-carte"><div class="profil-stat-icone">📝</div><div class="profil-stat-valeur">${data.total_exercices}</div><div class="profil-stat-label">exercices ajoutés</div></div>
    `;
    document.getElementById("enseignant-par-classe").innerHTML = data.par_classe.length
      ? data.par_classe.map((c) => `
          <div class="carte-ressource">
            <div class="carte-ressource-titre">${echapperHtml(c.classe)}</div>
            <div>🎥 ${c.videos} · 📝 ${c.exercices}</div>
          </div>`).join("")
      : `<p class="chargement-guide">Aucune ressource ajoutée pour l'instant.</p>`;
  } catch (erreur) {
    stats.innerHTML = `<p>⚠️ ${echapperHtml(erreur.message)}</p>`;
  }
  chargerDevoirsAssignes();
}

async function chargerDevoirsAssignes() {
  const liste = document.getElementById("liste-devoirs-assignes");
  try {
    const res = await fetchAuthentifie("/api/devoirs/assignes");
    const devoirs = await res.json();
    liste.innerHTML = devoirs.length
      ? devoirs.map((d) => `<div class="carte-ressource"><div class="carte-ressource-titre">${echapperHtml(d.matiere)} (${echapperHtml(d.classe)}) — ${echapperHtml(d.question)}</div><div class="carte-ressource-meta">Échéance : ${d.date_limite}</div></div>`).join("")
      : `<p class="chargement-guide">Aucun devoir assigné pour l'instant.</p>`;
  } catch { /* silencieux */ }
}

document.getElementById("btn-assigner-devoir").addEventListener("click", async () => {
  const matiere = document.getElementById("devoir-matiere").value.trim();
  const classe = document.getElementById("devoir-classe").value.trim();
  const dateLimite = document.getElementById("devoir-date-limite").value;
  const question = document.getElementById("devoir-question").value.trim();
  const choix = [0, 1, 2, 3].map((i) => document.getElementById(`devoir-choix-${i}`).value.trim());
  const reponseIndex = Number(document.querySelector('input[name="devoir-bonne-reponse"]:checked').value);
  const statut = document.getElementById("statut-devoir");

  if (!matiere || !classe || !dateLimite || !question || choix.some((c) => !c)) {
    alert("Remplis tous les champs avant d'assigner le devoir.");
    return;
  }
  statut.textContent = "Envoi en cours…";
  try {
    const res = await fetchAuthentifie("/api/devoirs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere, classe, question, choix, reponse_index: reponseIndex, explication: "", date_limite: dateLimite }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));
    statut.textContent = "✅ Devoir assigné !";
    document.getElementById("devoir-question").value = "";
    choix.forEach((_, i) => (document.getElementById(`devoir-choix-${i}`).value = ""));
    chargerDevoirsAssignes();
  } catch (erreur) {
    statut.textContent = "⚠️ " + erreur.message;
  }
});


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
    localStorage.setItem("inous_jeton_rafraichissement", data.jeton_rafraichissement);
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
  localStorage.removeItem("inous_jeton_rafraichissement");
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
    const res = await fetchAuthentifie("/api/profil");
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
      content: "Tu es INO-Education, un assistant éducatif. Réponds simplement, clairement et brièvement, en français, sans mise en forme spéciale (pas de JSON, pas de balises).",
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
