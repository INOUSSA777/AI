"""
INOUS.AI - point d'entrée de l'application FastAPI.

Lancer avec :  uvicorn main:app --reload
Puis ouvrir :  http://127.0.0.1:8000
"""

import io
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
from pydantic import BaseModel

from services import chat_ai

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


class TexteAParler(BaseModel):
    texte: str


@app.get("/api/sante")
def sante():
    """Vérifie que l'API répond et que la clé OpenAI est bien configurée."""
    return {"statut": "ok", "cle_api_configuree": bool(os.getenv("OPENAI_API_KEY"))}


@app.post("/api/chat")
def chat(message: MessageChat):
    if not message.question.strip():
        raise HTTPException(status_code=400, detail="La question est vide.")
    try:
        reponse = chat_ai.chat_response(message.question, message.historique)
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


@app.post("/api/parler")
def parler(donnees: TexteAParler):
    """Convertit du texte en audio (mp3) et le renvoie directement."""
    if not donnees.texte.strip():
        raise HTTPException(status_code=400, detail="Le texte est vide.")
    try:
        tts = gTTS(text=donnees.texte, lang="fr")
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


# Sert l'interface (index.html, style.css, script.js) située dans web/
CHEMIN_WEB = os.path.join(os.path.dirname(__file__), "web")
app.mount("/", StaticFiles(directory=CHEMIN_WEB, html=True), name="web")
