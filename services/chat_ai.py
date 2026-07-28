"""
Service central de INOUS.AI : toute la logique d'appel au modèle d'IA
passe par ce fichier. Le reste de l'app (routes FastAPI) ne parle jamais
directement à l'API OpenAI, seulement à ce service.
"""

import base64
import os

from openai import OpenAI

# Le client lit automatiquement la variable d'environnement OPENAI_API_KEY.
# Ne jamais écrire la clé en dur dans le code.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL_TEXTE = "gpt-4o-mini"
MODEL_VISION = "gpt-4o-mini"  # même modèle, il gère aussi les images

SYSTEM_PROMPT = (
    "Tu es INOUS.AI, un assistant éducatif sérieux et bienveillant. "
    "Réponds de façon claire, structurée et précise. "
    "Explique comme à un étudiant qui découvre le sujet."
)


def chat_response(question: str, historique = None) -> str:
    """
    Envoie une question (+ historique optionnel) au modèle et renvoie
    la réponse texte.

    historique : liste de messages précédents au format
                 [{"role": "user"/"assistant", "content": "..."}]
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if historique:
        messages.extend(historique)
    messages.append({"role": "user", "content": question})

    reponse = client.chat.completions.create(
        model=MODEL_TEXTE,
        messages=messages,
        temperature=0.7,
        max_tokens=600,
    )
    return reponse.choices[0].message.content.strip()


def analyser_image(image_bytes: bytes, question: str = "Décris cette image en détail.") -> str:
    """
    Envoie une image (bytes) + une question au modèle de vision et
    renvoie l'analyse en texte.
    """
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    reponse = client.chat.completions.create(
        model=MODEL_VISION,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                    },
                ],
            },
        ],
        max_tokens=600,
    )
    return reponse.choices[0].message.content.strip()


def transcrire_audio(audio_bytes: bytes, nom_fichier: str = "audio.webm") -> str:
    """
    Transcrit un audio (voix de l'utilisateur) en texte via Whisper.
    """
    import io

    fichier_audio = io.BytesIO(audio_bytes)
    fichier_audio.name = nom_fichier  # l'API a besoin d'un nom avec extension

    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=fichier_audio,
    )
    return transcription.text
