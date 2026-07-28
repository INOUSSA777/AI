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

let historique = [];
let imageSelectionnee = null; // { fichier, dataUrl }
let enregistreur = null;
let chunksAudio = [];
let enEcoute = false;

// ---------- vérification de l'API au chargement ----------
async function verifierSante() {
  try {
    const res = await fetch("/api/sante");
    const data = await res.json();
    if (data.cle_api_configuree) {
      statutEl.classList.add("pret");
      statutTexte.textContent = "Connecté";
    } else {
      statutEl.classList.add("erreur");
      statutTexte.textContent = "Clé API manquante (.env)";
    }
  } catch {
    statutEl.classList.add("erreur");
    statutTexte.textContent = "Backend injoignable";
  }
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
  div.innerHTML = `<div class="bulle chargement">INOUS.AI réfléchit…</div>`;
  filConversation.appendChild(div);
  filConversation.scrollTop = filConversation.scrollHeight;
  return div;
}

function echapperHtml(texte) {
  const d = document.createElement("div");
  d.textContent = texte;
  return d.innerHTML;
}

// ---------- gestion de l'image jointe ----------
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
      body: JSON.stringify({ question: texte, historique }),
    });
    const data = await res.json();
    bulleChargement.remove();

    if (!res.ok) throw new Error(data.detail || "Erreur inconnue");

    ajouterMessage("assistant", echapperHtml(data.reponse));
    historique.push({ role: "user", content: texte });
    historique.push({ role: "assistant", content: data.reponse });
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

async function envoyerImage(question) {
  const questionEffective = question || "Décris cette image en détail.";
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

    if (!res.ok) throw new Error(data.detail || "Erreur inconnue");

    ajouterMessage("assistant", echapperHtml(data.reponse));
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

// ---------- mode vocal (micro -> transcription -> chat -> voix) ----------
boutonMicro.addEventListener("click", async () => {
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
      boutonMicro.classList.remove("actif");
      flux.getTracks().forEach((piste) => piste.stop());

      const blobAudio = new Blob(chunksAudio, { type: "audio/webm" });
      await traiterAudio(blobAudio);
    };

    enregistreur.start();
    enEcoute = true;
    boutonMicro.classList.add("actif");
  } catch {
    ajouterMessage("assistant", "⚠️ Impossible d'accéder au micro.");
  }
});

async function traiterAudio(blobAudio) {
  const bulleChargement = ajouterChargement();
  bulleChargement.querySelector(".bulle").textContent = "Transcription en cours…";

  try {
    // 1. Transcrire la voix en texte
    const formData = new FormData();
    formData.append("fichier", blobAudio, "audio.webm");
    const resTranscription = await fetch("/api/transcrire", { method: "POST", body: formData });
    const dataTranscription = await resTranscription.json();
    if (!resTranscription.ok) throw new Error(dataTranscription.detail || "Erreur de transcription");

    bulleChargement.remove();
    const texteUtilisateur = dataTranscription.texte;
    ajouterMessage("user", echapperHtml(texteUtilisateur));

    // 2. Envoyer au chat
    const bulleReflexion = ajouterChargement();
    const resChat = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: texteUtilisateur, historique }),
    });
    const dataChat = await resChat.json();
    bulleReflexion.remove();
    if (!resChat.ok) throw new Error(dataChat.detail || "Erreur inconnue");

    ajouterMessage("assistant", echapperHtml(dataChat.reponse));
    historique.push({ role: "user", content: texteUtilisateur });
    historique.push({ role: "assistant", content: dataChat.reponse });

    // 3. Faire lire la réponse à voix haute
    const resParole = await fetch("/api/parler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texte: dataChat.reponse }),
    });
    if (resParole.ok) {
      const blobMp3 = await resParole.blob();
      const audio = new Audio(URL.createObjectURL(blobMp3));
      audio.play();
    }
  } catch (erreur) {
    bulleChargement.remove();
    ajouterMessage("assistant", `⚠️ ${echapperHtml(erreur.message)}`);
  }
}

// ---------- effacer la session ----------
btnEffacer.addEventListener("click", () => {
  historique = [];
  filConversation.innerHTML = "";
  ajouterMessage("assistant", "Session effacée. On repart de zéro !");
});
