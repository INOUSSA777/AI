"""
Service central de INOUS.AI : toute la logique d'appel au modèle d'IA
passe par ce fichier. Le reste de l'app (routes FastAPI) ne parle jamais
directement aux API IA, seulement à ce service.

Deux fournisseurs sont utilisés :
- Groq (gratuit) pour le chat texte et la transcription vocale (Whisper).
- OpenAI (payant) pour l'analyse d'image et la génération d'image, deux
  fonctions que Groq ne propose pas.
Les deux exposent une API compatible avec le SDK "openai" : seule l'adresse
(base_url) et la clé changent.
"""

import base64
import os

from openai import OpenAI

# Le client lit automatiquement la variable d'environnement associée.
# Ne jamais écrire une clé en dur dans le code.
client_groq = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
client_openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL_TEXTE = "llama-3.3-70b-versatile"  # via Groq, gratuit
MODEL_TRANSCRIPTION = "whisper-large-v3"  # via Groq, gratuit
MODEL_VISION = "gpt-4o-mini"  # via OpenAI (Groq ne fait pas d'analyse d'image fiable)
MODEL_IMAGE = "gpt-image-1"  # via OpenAI (Groq ne génère pas d'images)

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


CONSIGNE_STRUCTURE = (
    "\n\nINSTRUCTION DE MISE EN FORME OBLIGATOIRE :\n"
    "Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, "
    "sans balises markdown (pas de ```).\n"
    "Champs TOUJOURS présents :\n"
    '{"definition": "1 à 2 phrases maximum, jamais plus", '
    '"explications": ["point clé 1", "point clé 2", "point clé 3 : analogie, intuition ou erreur fréquente si pertinent"], '
    '"exemples": ["premier exemple concret, détaillé étape par étape si c\'est un calcul", '
    '"deuxième exemple concret, différent du premier"], '
    '"anticipations": [{"titre": "court intitulé de 2 à 5 mots", "contenu": "réponse complète à ce sujet connexe"}, '
    '... (exactement 5 objets au total)]}\n\n'
    '"anticipations" contient exactement 5 sujets connexes que l\'élève pourrait vouloir approfondir ensuite '
    "(une notion liée, une question qu'il se poserait naturellement après ta réponse, un point qu'on confond souvent avec celui-ci, "
    "une application pratique, une variante de l'exercice...). "
    '"titre" est très court (sert de libellé de bouton), "contenu" est la réponse complète et autonome à ce sujet, '
    "avec la même qualité qu'une vraie réponse (peut utiliser du LaTeX entre $ si besoin).\n\n"
    "Champs OPTIONNELS, à ajouter UNIQUEMENT quand le sujet s'y prête vraiment (ne pas forcer) :\n"
    '- "chronologie": [{"date": "...", "evenement": "..."}] si la question est historique\n'
    '- "langue_info": {"traduction": "...", "prononciation": "...", "pieges": "erreur fréquente à éviter"} '
    "si la question porte sur une langue étrangère\n"
    '- "graphique": {"titre": "...", "type": "ligne" ou "barres", '
    '"points": [{"x": valeur, "y": nombre}, ...]} si une courbe ou un diagramme aiderait vraiment '
    "à comprendre (sciences, économie, statistiques) — donne de vraies valeurs numériques cohérentes, "
    "au moins 4 points\n"
    '- "exemple_burkina": "un exemple concret et réaliste lié au Burkina Faso" si pertinent '
    "(économie, société, sciences appliquées)\n\n"
    '"explications" doit être une LISTE de 3 à 5 points clés courts (jamais un paragraphe). '
    "Utilise du LaTeX entre symboles $ pour toute formule ou calcul mathématique (ex: $f'(a) = 2x$). "
    'Le tableau "exemples" doit toujours contenir au moins 2 éléments distincts, jamais un seul.'
)


def chat_response(question: str, historique=None, langue: str = "fr", structuree: bool = False) -> str:
    """
    Envoie une question (+ historique optionnel) au modèle et renvoie
    la réponse texte, dans la langue demandée.

    historique : liste de messages précédents au format
                 [{"role": "user"/"assistant", "content": "..."}]
    langue : code de langue ("fr", "en", "moore")
    structuree : si True, impose le format Définition / Explications / Exemples
                 (utilisé uniquement par le chat principal, pas par les autres écrans)
    """
    nom_langue = LANGUES.get(langue, LANGUES["fr"])
    consigne_langue = (
        f"\nRéponds impérativement en {nom_langue}, quelle que soit la langue "
        f"utilisée par l'utilisateur dans sa question."
    )
    if structuree:
        consigne_langue += CONSIGNE_STRUCTURE

    messages = [{"role": "system", "content": SYSTEM_PROMPT + consigne_langue}]
    if historique:
        messages.extend(historique)
    messages.append({"role": "user", "content": question})

    reponse = client_groq.chat.completions.create(
        model=MODEL_TEXTE,
        messages=messages,
        temperature=0.7,
        max_tokens=1600 if structuree else 600,
    )
    return reponse.choices[0].message.content.strip()


def generer_image(prompt: str) -> bytes:
    """
    Génère une image à partir d'une description texte et renvoie
    les octets bruts de l'image (PNG).
    """
    reponse = client_openai.images.generate(
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

    reponse = client_openai.chat.completions.create(
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

    transcription = client_groq.audio.transcriptions.create(
        model=MODEL_TRANSCRIPTION,
        file=fichier_audio,
    )
    return transcription.text


# Limite de caractères conservés d'un PDF importé, pour garder des questions
# rapides et abordables (le texte complet part quand même en contexte à
# chaque question posée dessus).
LIMITE_CARACTERES_PDF = 12000


def extraire_texte_pdf(pdf_bytes: bytes) -> tuple[str, bool]:
    """
    Extrait le texte d'un PDF. Renvoie (texte, a_ete_tronque).
    Ne stocke rien sur le serveur : le texte est renvoyé au frontend, qui le
    garde en mémoire le temps de la session (rien ne persiste après un
    rechargement de la page).
    """
    import io

    from pypdf import PdfReader

    lecteur = PdfReader(io.BytesIO(pdf_bytes))
    morceaux = []
    for page in lecteur.pages:
        texte_page = page.extract_text() or ""
        morceaux.append(texte_page)

    texte_complet = "\n".join(morceaux).strip()
    a_ete_tronque = len(texte_complet) > LIMITE_CARACTERES_PDF
    return texte_complet[:LIMITE_CARACTERES_PDF], a_ete_tronque
