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
const boutonsModes = document.querySelectorAll(".mode-btn");
const formulaireGeneration = document.getElementById("formulaire-generation");
const entreePromptImage = document.getElementById("entree-prompt-image");
const boutonMicroImage = document.getElementById("bouton-micro-image");

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
    modeDiscussion: "Discussion",
    modeImage: "Analyser une image",
    modeVoix: "Voix",
    modeGeneration: "Générer une image",
    labelLangue: "Langue de conversation",
    btnEffacer: "Effacer la session",
    statutVerification: "Vérification…",
    statutConnecte: "Connecté",
    statutCleManquante: "Clé API manquante (.env)",
    statutInjoignable: "Backend injoignable",
    messageAccueil: 'Bonjour, je suis <strong>INOUS.AI</strong>. Pose-moi une question de cours, envoie-moi une image à analyser, ou parle-moi directement au micro.',
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
  },
  en: {
    sousTitre: "Educational assistant",
    modeDiscussion: "Chat",
    modeImage: "Analyze an image",
    modeVoix: "Voice",
    modeGeneration: "Generate an image",
    labelLangue: "Conversation language",
    btnEffacer: "Clear session",
    statutVerification: "Checking…",
    statutConnecte: "Connected",
    statutCleManquante: "Missing API key (.env)",
    statutInjoignable: "Backend unreachable",
    messageAccueil: 'Hello, I\'m <strong>INOUS.AI</strong>. Ask me a question about your coursework, send me an image to analyze, or just speak into the microphone.',
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
  },
  moore: {
    sousTitre: "Karen-sõngda (assistant éducatif)",
    modeDiscussion: "Gomde",
    modeImage: "Fo foto ges-gu",
    modeVoix: "Koɛɛg",
    modeGeneration: "Foto naaneg",
    labelLangue: "Goam sẽn na n tũ",
    btnEffacer: "Yiisi gomd-kãngã",
    statutVerification: "D gũusda…",
    statutConnecte: "Yaa vẽeneg",
    statutCleManquante: "Zĩmb-koɛɛg ka be ye (.env)",
    statutInjoignable: "D ka tõe n paas serveur ye",
    messageAccueil: 'Ne y windiga, mam yaa <strong>INOUS.AI</strong>. Sok-m sõsg zãmsg wɛɛngẽ, tʋm-m foto tɩ m ges, wall gom ne mam ne koɛɛg.',
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

// ---------- bascule entre les modes (Discussion / Analyser / Voix / Générer) ----------
boutonsModes.forEach((bouton) => {
  bouton.addEventListener("click", () => {
    boutonsModes.forEach((b) => b.classList.remove("actif"));
    bouton.classList.add("actif");
    modeActif = bouton.dataset.mode;

    if (modeActif === "generation") {
      formulaire.hidden = true;
      formulaireGeneration.hidden = false;
    } else {
      formulaire.hidden = false;
      formulaireGeneration.hidden = true;
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
function ajouterMessage(role, contenuHtml) {
  const div = document.createElement("div");
  div.className = `message ${role === "user" ? "message-utilisateur" : "message-ia"}`;
  div.innerHTML = `<div class="bulle">${contenuHtml}</div>`;
  filConversation.appendChild(div);
  filConversation.scrollTop = filConversation.scrollHeight;
  return div;
}

function ajouterChargement() {
  const div = document.createElement("div");
  div.className = "message message-ia";
  div.innerHTML = `<div class="bulle chargement">${texteTraduit("reflexion")}</div>`;
  filConversation.appendChild(div);
  filConversation.scrollTop = filConversation.scrollHeight;
  return div;
}

function echapperHtml(texte) {
  const d = document.createElement("div");
  d.textContent = texte;
  return d.innerHTML;
}

// ---------- découpe une réponse en phrases + bouton audio après chacune ----------
function construireReponseAvecAudio(texteReponse) {
  const langue = selecteurLangue.value;
  const phrases = texteReponse.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [texteReponse];

  let html = "";
  phrases.forEach((phrase) => {
    const propre = phrase.trim();
    if (!propre) return;
    html += echapperHtml(propre) + " ";
    if (langue !== "moore") {
      const index = bibliothequePhrases.length;
      bibliothequePhrases.push(propre);
      html += `<button type="button" class="btn-audio-phrase" data-index="${index}" title="🔊">🔊</button> `;
    }
  });

  if (langue === "moore") {
    html += `<span class="note-audio-indisponible">${texteTraduit("audioIndisponibleMoore")}</span>`;
  }

  return html;
}

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
    new Audio(URL.createObjectURL(blob)).play();
  } catch {
    // audio best-effort : en cas d'échec, le texte reste affiché normalement
  }
}

// écoute déléguée : clic sur un bouton audio de phrase, où qu'il soit dans le fil
filConversation.addEventListener("click", async (e) => {
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
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
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

// ---------- envoi du formulaire (texte et/ou image) ----------
formulaire.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texte = entreeTexte.value.trim();
  if (!texte && !imageSelectionnee) return;

  if (imageSelectionnee) {
    await envoyerImage(texte);
  } else {
    await envoyerTexte(texte);
  }
});

async function envoyerTexte(texte) {
  ajouterMessage("user", echapperHtml(texte));
  entreeTexte.value = "";
  const bulleChargement = ajouterChargement();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: texte, historique, langue: selecteurLangue.value }),
    });
    const data = await res.json();
    bulleChargement.remove();

    if (!res.ok) throw new Error(data.detail || texteTraduit("erreurInconnue"));

    ajouterMessage("assistant", construireReponseAvecAudio(data.reponse));
    lireAudioAutomatique(data.reponse);
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

// Micro du chat : transcrit puis envoie directement la question au chat
creerBoutonMicro(boutonMicro, async (texteUtilisateur) => {
  ajouterMessage("user", echapperHtml(texteUtilisateur));

  const bulleReflexion = ajouterChargement();
  try {
    const resChat = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: texteUtilisateur, historique, langue: selecteurLangue.value }),
    });
    const dataChat = await resChat.json();
    bulleReflexion.remove();
    if (!resChat.ok) throw new Error(dataChat.detail || texteTraduit("erreurInconnue"));

    ajouterMessage("assistant", construireReponseAvecAudio(dataChat.reponse));
    lireAudioAutomatique(dataChat.reponse);
    historique.push({ role: "user", content: texteUtilisateur });
    historique.push({ role: "assistant", content: dataChat.reponse });
  } catch (erreur) {
    bulleReflexion.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
});

// Micro de la génération d'image : transcrit et remplit juste le champ,
// pour laisser l'utilisateur relire/ajuster avant de cliquer sur Générer
creerBoutonMicro(boutonMicroImage, async (texteUtilisateur) => {
  entreePromptImage.value = texteUtilisateur;
  entreePromptImage.focus();
});

// ---------- génération d'image ----------
formulaireGeneration.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = entreePromptImage.value.trim();
  if (!prompt) return;

  ajouterMessage("user", `🎨 ${echapperHtml(prompt)}`);
  entreePromptImage.value = "";
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
});

// ---------- effacer la session ----------
btnEffacer.addEventListener("click", () => {
  historique = [];
  bibliothequePhrases = [];
  filConversation.innerHTML = "";
  ajouterMessage("assistant", texteTraduit("sessionEffacee"));
});
