"""
Devoirs assignés par un enseignant à une classe, avec une date limite.
S'appuie sur les mêmes exercices personnalisés déjà écrits par l'enseignant
(services/ressources.py) — un devoir est juste un exercice avec une échéance.
"""

from services import auth as auth_service


def assigner_devoir(id_utilisateur: str, matiere: str, classe: str, question: str,
                     choix: list[str], reponse_index: int, explication: str, date_limite: str) -> dict:
    client = auth_service.obtenir_client()
    ligne = {
        "matiere": matiere, "classe": classe, "question": question,
        "choix": choix, "reponse_index": reponse_index, "explication": explication,
        "assigne_par": id_utilisateur, "date_limite": date_limite,
    }
    return client.table("devoirs").insert(ligne).execute().data[0]


def lister_devoirs_classe(classe: str) -> list[dict]:
    client = auth_service.obtenir_client()
    return (
        client.table("devoirs").select("*").eq("classe", classe)
        .order("date_limite").execute().data
    )


def lister_devoirs_assignes(id_utilisateur: str) -> list[dict]:
    """Ceux qu'un enseignant a lui-même assignés."""
    client = auth_service.obtenir_client()
    return (
        client.table("devoirs").select("*").eq("assigne_par", id_utilisateur)
        .order("date_limite", desc=True).execute().data
    )


def marquer_devoir_fait(id_utilisateur: str, id_devoir: str, score: int, total: int) -> dict:
    client = auth_service.obtenir_client()
    ligne = {"user_id": id_utilisateur, "devoir_id": id_devoir, "score": score, "total": total}
    return client.table("devoirs_faits").upsert(ligne, on_conflict="user_id,devoir_id").execute().data[0]


def devoirs_faits_par(id_utilisateur: str) -> list[dict]:
    client = auth_service.obtenir_client()
    return client.table("devoirs_faits").select("devoir_id").eq("user_id", id_utilisateur).execute().data
