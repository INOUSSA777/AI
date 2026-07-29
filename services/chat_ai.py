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
MODEL_IMAGE = "gpt-image-1"

SYSTEM_PROMPT = (
    "Tu es INOUS.AI, un assistant éducatif sérieux et bienveillant. "
    "Réponds de façon claire, structurée et précise. "
    "Explique comme à un étudiant qui découvre le sujet."
)

# Langues proposées dans le sélecteur de l'interface.
# La clé est le code envoyé par le frontend, la valeur le nom complet
# donné au modèle pour qu'il sache dans quelle langue répondre.
LANGUES = {
    "fr": "français",
    "en": "English",
    "moore": "mooré (langue du Burkina Faso)",
}

# Codes de langue compris par gTTS (le moteur de synthèse vocale utilisé).
# Le mooré n'est pas supporté par gTTS (ni par la plupart des moteurs vocaux
# gratuits actuels) : on le signale explicitement plutôt que de produire un
# audio qui ne correspondrait pas à la langue demandée.
LANGUES_GTTS = {
    "fr": "fr",
    "en": "en",
}


def chat_response(question: str, historique=None, langue: str = "fr") -> str:
    """
    Envoie une question (+ historique optionnel) au modèle et renvoie
    la réponse texte, dans la langue demandée.

    historique : liste de messages précédents au format
                 [{"role": "user"/"assistant", "content": "..."}]
    langue : code de langue ("fr", "en", "moore")
    """
    nom_langue = LANGUES.get(langue, LANGUES["fr"])
    consigne_langue = (
        f"\nRéponds impérativement en {nom_langue}, quelle que soit la langue "
        f"utilisée par l'utilisateur dans sa question."
    )

    messages = [{"role": "system", "content": SYSTEM_PROMPT + consigne_langue}]
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


def generer_image(prompt: str) -> bytes:
    """
    Génère une image à partir d'une description texte et renvoie
    les octets bruts de l'image (PNG).
    """
    reponse = client.images.generate(
        model=MODEL_IMAGE,
        prompt=prompt,
        size="1024x1024",
        n=1,
    )
    image_b64 = reponse.data[0].b64_json
    return base64.b64decode(image_b64)


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
