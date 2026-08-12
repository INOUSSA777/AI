"""
INOUS.AI - point d'entrée de l'application FastAPI.

Lancer avec :  uvicorn main:app --reload
Puis ouvrir :  http://127.0.0.1:8000
"""

import io
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
from pydantic import BaseModel

from services import chat_ai
from services import auth as auth_service
from services import bibliotheque as bibliotheque_service
from services import profil as profil_service
from services import ressources as ressources_service
from services import revision as revision_service
from services import devoirs as devoirs_service
from services import notifications as notifications_service

app = FastAPI(title="INOUS.AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageChat(BaseModel):
    question: str
    historique: list[dict] = []
    langue: str = "fr"
    structuree: bool = False
    statut: str = "eleve"


class TexteAParler(BaseModel):
    texte: str
    langue: str = "fr"


class PromptImage(BaseModel):
    prompt: str


class IdentifiantsCompte(BaseModel):
    email: str
    mot_de_passe: str


class JetonRafraichissement(BaseModel):
    jeton_rafraichissement: str


class ActiviteAEnregistrer(BaseModel):
    type_activite: str
    matiere: str | None = None
    sujet: str | None = None
    score: int | None = None
    total: int | None = None
    classe: str | None = None


class GenererFiches(BaseModel):
    matiere: str
    classe: str
    sujet: str
    texte_source: str | None = None


class ReponseFiche(BaseModel):
    correct: bool


class VideoLien(BaseModel):
    matiere: str
    classe: str
    titre: str
    url: str


class ExerciceAAjouter(BaseModel):
    matiere: str
    classe: str
    question: str
    choix: list[str]
    reponse_index: int
    explication: str = ""


class DemandeReinitialisation(BaseModel):
    email: str
    url_retour: str


class NouveauMotDePasse(BaseModel):
    access_token: str
    refresh_token: str
    nouveau_mot_de_passe: str


class CodeReinitialisation(BaseModel):
    email: str
    code: str
    nouveau_mot_de_passe: str


class ParametresClassement(BaseModel):
    classe: str
    visible: bool


class DevoirAAssigner(BaseModel):
    matiere: str
    classe: str
    question: str
    choix: list[str]
    reponse_index: int
    explication: str = ""
    date_limite: str


class DevoirFait(BaseModel):
    score: int
    total: int


class AbonnementPush(BaseModel):
    abonnement: dict


@app.get("/api/sante")
def sante():
    """Vérifie que l'API répond et que les clés nécessaires sont configurées."""
    return {
        "statut": "ok",
        "cle_api_configuree": bool(os.getenv("GROQ_API_KEY")),
        "cle_groq_configuree": bool(os.getenv("GROQ_API_KEY")),
        "cle_openai_configuree": bool(os.getenv("OPENAI_API_KEY")),
    }


@app.post("/api/chat")
def chat(message: MessageChat):
    if not message.question.strip():
        raise HTTPException(status_code=400, detail="La question est vide.")
    try:
        reponse = chat_ai.chat_response(message.question, message.historique, message.langue, message.structuree, message.statut)
        return {"reponse": reponse}
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/analyser-image")
async def analyser_image(fichier: UploadFile = File(...), question: str = "Décris cette image en détail."):
    try:
        contenu = await fichier.read()
        reponse = chat_ai.analyser_image(contenu, question)
        return {"reponse": reponse}
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/generer-image")
def generer_image(donnees: PromptImage):
    """Génère une image à partir d'une description texte."""
    if not donnees.prompt.strip():
        raise HTTPException(status_code=400, detail="La description est vide.")
    try:
        image_bytes = chat_ai.generer_image(donnees.prompt)
        return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/parler")
def parler(donnees: TexteAParler):
    """Convertit du texte en audio (mp3) et le renvoie directement."""
    if not donnees.texte.strip():
        raise HTTPException(status_code=400, detail="Le texte est vide.")

    code_gtts = chat_ai.LANGUES_GTTS.get(donnees.langue)
    if code_gtts is None:
        raise HTTPException(
            status_code=400,
            detail="La lecture audio n'est pas disponible en mooré pour le moment.",
        )

    try:
        tts = gTTS(text=donnees.texte, lang=code_gtts)
        buffer = io.BytesIO()
        tts.write_to_fp(buffer)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/mpeg")
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/transcrire")
async def transcrire(fichier: UploadFile = File(...)):
    """Transcrit un enregistrement vocal de l'utilisateur en texte."""
    try:
        contenu = await fichier.read()
        texte = chat_ai.transcrire_audio(contenu, fichier.filename or "audio.webm")
        return {"texte": texte}
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/importer-pdf")
async def importer_pdf(fichier: UploadFile = File(...)):
    """
    Extrait le texte d'un PDF importé (Bibliothèque). Rien n'est sauvegardé
    côté serveur : le texte est renvoyé au frontend qui le garde en mémoire
    pour la session en cours uniquement.
    """
    try:
        contenu = await fichier.read()
        texte, tronque = chat_ai.extraire_texte_pdf(contenu)
        if not texte.strip():
            raise HTTPException(
                status_code=400,
                detail="Aucun texte n'a pu être extrait (PDF scanné/image sans texte reconnaissable ?).",
            )
        return {"texte": texte, "tronque": tronque, "nom": fichier.filename}
    except HTTPException:
        raise
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/auth/inscription")
def inscription(donnees: IdentifiantsCompte):
    try:
        resultat = auth_service.inscrire(donnees.email, donnees.mot_de_passe)
        return resultat
    except Exception as erreur:
        raise HTTPException(status_code=400, detail=str(erreur))


@app.post("/api/auth/connexion")
def connexion(donnees: IdentifiantsCompte):
    try:
        resultat = auth_service.connecter(donnees.email, donnees.mot_de_passe)
        return resultat
    except Exception as erreur:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")


@app.post("/api/auth/rafraichir")
def rafraichir(donnees: JetonRafraichissement):
    """Renouvelle un jeton d'accès expiré, sans redemander le mot de passe."""
    try:
        return auth_service.rafraichir_session(donnees.jeton_rafraichissement)
    except Exception as erreur:
        raise HTTPException(status_code=401, detail="Session expirée, reconnecte-toi.")


@app.post("/api/auth/mot-de-passe-oublie")
def mot_de_passe_oublie(donnees: DemandeReinitialisation):
    try:
        auth_service.envoyer_lien_reinitialisation(donnees.email, donnees.url_retour)
        return {"ok": True}
    except Exception as erreur:
        raise HTTPException(status_code=400, detail=str(erreur))


@app.post("/api/auth/nouveau-mot-de-passe")
def nouveau_mot_de_passe(donnees: NouveauMotDePasse):
    if len(donnees.nouveau_mot_de_passe) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caractères.")
    try:
        auth_service.definir_nouveau_mot_de_passe(
            donnees.access_token, donnees.refresh_token, donnees.nouveau_mot_de_passe
        )
        return {"ok": True}
    except Exception as erreur:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré. Redemande un lien de réinitialisation.")


@app.post("/api/auth/verifier-code")
def verifier_code(donnees: CodeReinitialisation):
    if len(donnees.nouveau_mot_de_passe) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caractères.")
    try:
        auth_service.verifier_code_et_definir_mot_de_passe(
            donnees.email, donnees.code, donnees.nouveau_mot_de_passe
        )
        return {"ok": True}
    except Exception as erreur:
        raise HTTPException(status_code=400, detail="Code incorrect ou expiré. Redemande un nouveau code.")


@app.get("/api/profil")
def profil(authorization: str = ""):
    """Renvoie le profil réel (points, série) de l'utilisateur connecté."""
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return auth_service.obtenir_profil(utilisateur.id)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/profil/activite")
def enregistrer_activite_profil(donnees: ActiviteAEnregistrer, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return profil_service.enregistrer_activite(
            utilisateur.id, donnees.type_activite, donnees.matiere, donnees.sujet,
            donnees.score, donnees.total, donnees.classe,
        )
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/profil/maitrise")
def maitrise_route(classe: str = "", authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return profil_service.obtenir_maitrise(utilisateur.id, classe or None)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/fiches/generer")
def generer_fiches_route(donnees: GenererFiches, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour générer des fiches.")
    try:
        return revision_service.generer_fiches(
            utilisateur.id, donnees.matiere, donnees.classe, donnees.sujet, texte_source=donnees.texte_source
        )
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/fiches/a-reviser")
def fiches_a_reviser_route(matiere: str = "", classe: str = "", authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour voir tes fiches.")
    try:
        return revision_service.fiches_a_reviser(utilisateur.id, matiere or None, classe or None)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/fiches/{id_fiche}/repondre")
def repondre_fiche_route(id_fiche: str, donnees: ReponseFiche, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi.")
    try:
        return revision_service.repondre_fiche(utilisateur.id, id_fiche, donnees.correct)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/profil/historique")
def historique_profil(authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return {
            "historique": profil_service.obtenir_historique(utilisateur.id),
            "stats": profil_service.obtenir_stats(utilisateur.id),
        }
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/profil/badges")
def badges_route(authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return profil_service.obtenir_badges(utilisateur.id)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/profil/classement-parametres")
def classement_parametres_route(donnees: ParametresClassement, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return profil_service.definir_parametres_classement(utilisateur.id, donnees.classe, donnees.visible)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/classement")
def classement_route(classe: str, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return profil_service.obtenir_classement(classe, utilisateur.id)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/enseignant/stats")
def enseignant_stats_route(authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        return ressources_service.obtenir_stats_enseignant(utilisateur.id)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/devoirs")
def assigner_devoir_route(donnees: DevoirAAssigner, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour assigner un devoir.")
    try:
        return devoirs_service.assigner_devoir(
            utilisateur.id, donnees.matiere, donnees.classe, donnees.question,
            donnees.choix, donnees.reponse_index, donnees.explication, donnees.date_limite,
        )
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/devoirs/classe")
def devoirs_classe_route(classe: str, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour voir tes devoirs.")
    try:
        devoirs = devoirs_service.lister_devoirs_classe(classe)
        faits = {d["devoir_id"] for d in devoirs_service.devoirs_faits_par(utilisateur.id)}
        for d in devoirs:
            d["fait"] = d["id"] in faits
        return devoirs
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/devoirs/assignes")
def devoirs_assignes_route(authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi.")
    try:
        return devoirs_service.lister_devoirs_assignes(utilisateur.id)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/devoirs/{id_devoir}/fait")
def devoir_fait_route(id_devoir: str, donnees: DevoirFait, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi.")
    try:
        return devoirs_service.marquer_devoir_fait(utilisateur.id, id_devoir, donnees.score, donnees.total)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/notifications/cle-publique")
def cle_publique_notifications():
    """Renvoie la clé publique VAPID nécessaire au navigateur pour s'abonner."""
    return {"cle_publique": os.getenv("VAPID_PUBLIC_KEY", "")}


@app.post("/api/notifications/abonnement")
def abonnement_notifications_route(donnees: AbonnementPush, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour activer les notifications.")
    try:
        return notifications_service.enregistrer_abonnement(utilisateur.id, donnees.abonnement)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/notifications/test")
def notification_test_route(authorization: str = ""):
    """Envoie une vraie notification de test, pour vérifier que ça fonctionne."""
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi.")
    envoye = notifications_service.envoyer_notification(
        utilisateur.id, "INOUS.AI", "🔔 Ceci est une vraie notification de test !"
    )
    if not envoye:
        raise HTTPException(status_code=400, detail="Notification non envoyée (pas encore activée, ou clé serveur manquante).")
    return {"ok": True}


@app.post("/api/videos/lien")
def ajouter_video_lien_route(donnees: VideoLien, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour ajouter une vidéo.")
    try:
        return ressources_service.ajouter_video_lien(utilisateur.id, donnees.matiere, donnees.classe, donnees.titre, donnees.url)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/videos/fichier")
async def ajouter_video_fichier_route(
    fichier: UploadFile = File(...),
    matiere: str = Form(...),
    classe: str = Form(...),
    titre: str = Form(...),
    authorization: str = "",
):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour ajouter une vidéo.")
    try:
        contenu = await fichier.read()
        return ressources_service.ajouter_video_fichier(
            utilisateur.id, matiere, classe, titre, fichier.filename, contenu,
            fichier.content_type or "video/mp4",
        )
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/videos")
def lister_videos_route(matiere: str = "", classe: str = ""):
    try:
        return ressources_service.lister_videos(matiere or None, classe or None)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/exercices")
def ajouter_exercice_route(donnees: ExerciceAAjouter, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour ajouter un exercice.")
    try:
        return ressources_service.ajouter_exercice(
            utilisateur.id, donnees.matiere, donnees.classe, donnees.question,
            donnees.choix, donnees.reponse_index, donnees.explication,
        )
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/exercices")
def lister_exercices_route(matiere: str = "", classe: str = ""):
    try:
        return ressources_service.lister_exercices(matiere or None, classe or None)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.get("/api/bibliotheque/documents")
def lister_documents_partages(categorie: str = "Tous", concours: str = ""):
    """Liste publique des documents partagés — pas besoin d'être connecté pour consulter."""
    try:
        return bibliotheque_service.lister_documents(categorie, concours or None)
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.post("/api/bibliotheque/partager")
async def partager_document(
    fichier: UploadFile = File(...),
    nom: str = Form(...),
    categorie: str = Form(...),
    concours: str = Form(""),
    authorization: str = "",
):
    """Uploader un document dans la bibliothèque partagée — réservé aux utilisateurs connectés."""
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Connecte-toi pour partager un document.")
    try:
        contenu = await fichier.read()

        categorie_finale = categorie
        if categorie == "Auto":
            extrait = bibliotheque_service.extraire_texte_apercu(fichier.filename, contenu)
            categorie_finale = bibliotheque_service.classifier_document(fichier.filename, extrait)

        document = bibliotheque_service.uploader_et_cataloguer(
            utilisateur.id, nom, categorie_finale, fichier.filename, contenu,
            fichier.content_type or "application/octet-stream", concours or None,
        )
        return document
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


@app.delete("/api/bibliotheque/documents/{id_document}")
def retirer_document(id_document: str, authorization: str = ""):
    jeton = authorization.replace("Bearer ", "")
    utilisateur = auth_service.utilisateur_depuis_jeton(jeton)
    if not utilisateur:
        raise HTTPException(status_code=401, detail="Non connecté.")
    try:
        bibliotheque_service.supprimer_document(id_document, utilisateur.id)
        return {"ok": True}
    except PermissionError as erreur:
        raise HTTPException(status_code=403, detail=str(erreur))
    except Exception as erreur:
        raise HTTPException(status_code=500, detail=str(erreur))


# Sert l'interface (index.html, style.css, script.js) située dans web/
CHEMIN_WEB = os.path.join(os.path.dirname(__file__), "web")


# Vérification Play Store (Trusted Web Activity) : le dossier .well-known étant
# masqué, on le sert via une route explicite AVANT le montage statique fourre-tout.
@app.get("/.well-known/assetlinks.json")
def assetlinks():
    from fastapi.responses import FileResponse
    chemin = os.path.join(CHEMIN_WEB, ".well-known", "assetlinks.json")
    return FileResponse(chemin, media_type="application/json")


app.mount("/", StaticFiles(directory=CHEMIN_WEB, html=True), name="web")
