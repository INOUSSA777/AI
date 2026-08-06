"""
Service de révision pour le secondaire :
- fiches de révision générées par l'IA, revues avec un système de répétition
  espacée (méthode de Leitner à 5 "boîtes") : une bonne réponse fait avancer
  la fiche vers un intervalle plus long, une erreur la ramène à la boîte 1.
"""

import json
import re
from datetime import datetime, timedelta, timezone

from services import auth as auth_service
from services import chat_ai

# nombre de jours avant la prochaine révision, selon la boîte atteinte
INTERVALLES_BOITE = {1: 0, 2: 2, 3: 4, 4: 7, 5: 14}


def generer_fiches(id_utilisateur: str, matiere: str, classe: str, sujet: str, nombre: int = 6) -> list[dict]:
    prompt = (
        f'Crée {nombre} fiches de révision façon flashcards sur "{sujet}" (matière : {matiere}, niveau {classe}). '
        f'Chaque fiche : un recto court (question ou notion) et un verso concis (réponse/explication). '
        f'Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour : '
        f'[{{"recto": "...", "verso": "..."}}]'
    )
    reponse = chat_ai.chat_response(prompt, historique=None, langue="fr", structuree=False)
    nettoye = re.sub(r"```json|```", "", reponse).strip()
    debut, fin = nettoye.find("["), nettoye.rfind("]")
    fiches = json.loads(nettoye[debut : fin + 1])

    client = auth_service.obtenir_client()
    maintenant = datetime.now(timezone.utc).isoformat()
    lignes = [
        {
            "user_id": id_utilisateur, "matiere": matiere, "classe": classe, "sujet": sujet,
            "recto": f["recto"], "verso": f["verso"], "boite": 1, "prochaine_revision": maintenant,
        }
        for f in fiches
    ]
    return client.table("fiches_revision").insert(lignes).execute().data


def fiches_a_reviser(id_utilisateur: str, matiere: str | None, classe: str | None) -> list[dict]:
    client = auth_service.obtenir_client()
    maintenant = datetime.now(timezone.utc).isoformat()
    requete = (
        client.table("fiches_revision")
        .select("*")
        .eq("user_id", id_utilisateur)
        .lte("prochaine_revision", maintenant)
    )
    if matiere:
        requete = requete.eq("matiere", matiere)
    if classe:
        requete = requete.eq("classe", classe)
    return requete.execute().data


def repondre_fiche(id_utilisateur: str, id_fiche: str, correct: bool) -> dict:
    client = auth_service.obtenir_client()
    fiche = (
        client.table("fiches_revision").select("*")
        .eq("id", id_fiche).eq("user_id", id_utilisateur).single().execute().data
    )
    if not fiche:
        raise ValueError("Fiche introuvable.")

    nouvelle_boite = min(fiche["boite"] + 1, 5) if correct else 1
    prochaine = datetime.now(timezone.utc) + timedelta(days=INTERVALLES_BOITE[nouvelle_boite])
    client.table("fiches_revision").update({
        "boite": nouvelle_boite, "prochaine_revision": prochaine.isoformat(),
    }).eq("id", id_fiche).execute()
    return {"boite": nouvelle_boite}
