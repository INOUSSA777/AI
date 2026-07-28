# INOUS.AI

Assistant IA éducatif : discussion, analyse d'image, mode vocal.
Backend FastAPI (racine `main.py`) + interface web dans `web/`.

## Démarrage rapide (Windows)

Double-clique sur **`setup_windows.bat`** (ou lance-le depuis un terminal :
`setup_windows.bat`). Il fait tout automatiquement : crée le venv, installe
les dépendances, prépare `.env` (et ouvre le Bloc-notes si la clé API n'est
pas encore renseignée), puis lance `uvicorn`.

## Installation manuelle (si tu préfères, ou sur macOS/Linux)

```bash
cd INOUS.AI
python -m venv venv
# Windows :
venv\Scripts\activate
# macOS / Linux :
source venv/bin/activate

pip install -r requirements.txt
```

Copie `.env.example` en `.env` et colle ta clé API OpenAI dedans :

```
OPENAI_API_KEY=sk-...
```

## Lancer le projet

Depuis la racine `INOUS.AI/` :

```bash
uvicorn main:app --reload
```

Puis ouvre **http://127.0.0.1:8000**.

## Structure finale

```
INOUS.AI/
├── main.py                  application FastAPI (routes + sert web/)
├── services/
│   ├── __init__.py
│   └── chat_ai.py           tous les appels à l'API OpenAI (texte, image, voix)
├── web/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── requirements.txt
├── .env.example
├── .gitignore
├── INOUS.AI.docx
└── archives_non_liees/      fichiers sans lien avec l'assistant (voir plus bas)
```

## Modifications appliquées directement sur TON projet

- **`main.py`** (racine) : entièrement réécrit. L'ancienne version plantait sur
  une variable `model` jamais définie. Nouvelle version = vraie app FastAPI
  avec les routes `/api/chat`, `/api/analyser-image`, `/api/parler`,
  `/api/transcrire`, `/api/sante`, et qui sert `web/` comme interface.
- **`services/serviceschat_ai.py` → `services/chat_ai.py`** : renommé pour
  correspondre à l'import attendu (`from services import chat_ai`), et
  remplacé — ce n'était que des `if "mot" in question` avec 4 réponses
  possibles, ce n'était pas une vraie IA. Maintenant il appelle réellement
  l'API OpenAI (chat, vision pour les images, Whisper pour la voix).
- **`web/app_web.py`** (le script Streamlit) supprimé et remplacé par une
  vraie interface `web/index.html` + `web/style.css` + `web/script.js`,
  servie directement par FastAPI — plus besoin de Streamlit du tout.
- **`APP.PY`** et l'ancien `app_web.py` à la racine : c'étaient deux autres
  tentatives d'interface (Streamlit) qui faisaient doublon avec `web/`.
  Déplacés dans `archives_non_liees/` pour ne garder qu'une seule interface,
  celle demandée dans `web/`.
- **`requirements.txt`** : était en UTF-16 (illisible par `pip install -r`
  tel quel) et listait `torch`/`transformers` (~5 Go, plus nécessaire
  puisqu'on utilise l'API OpenAI au lieu d'un modèle local). Réécrit en
  UTF-8 avec seulement les 6 dépendances utilisées.
- **`venv/`** : supprimé du projet. Un environnement virtuel ne doit jamais
  être livré ni versionné, il se régénère avec `pip install -r requirements.txt`
  (voir `.gitignore` ajouté).
- **`.env.example`** ajouté pour la clé API (`.env` lui-même est ignoré par git).

## `archives_non_liees/`

Fichiers qui n'avaient pas de rapport avec l'assistant IA — mis de côté plutôt
que supprimés, pour que rien ne soit perdu :
`TP1.py`, `tp2.py`, `tp3.py`, `tp3`, `tableau.py`, `tableau`, `Untitled-1.py`,
`reponse.mp3`, `.Rhistory`, ainsi que `APP.PY` et l'ancien `app_web.py`
racine (interfaces Streamlit remplacées par `web/`).
