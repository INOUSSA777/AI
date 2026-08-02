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


class DemandeReinitialisation(BaseModel):
    email: str
    url_retour: str


class NouveauMotDePasse(BaseModel):
    access_token: str
    refresh_token: str
    nouveau_mot_de_passe: str


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
        document = bibliotheque_service.uploader_et_cataloguer(
            utilisateur.id, nom, categorie, fichier.filename, contenu,
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
app.mount("/", StaticFiles(directory=CHEMIN_WEB, html=True), name="web")
