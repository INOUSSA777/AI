"""
Service du "Mon profil" : historique d'apprentissage réel, points et série
de jours actifs — tout est calculé à partir de vraies actions enregistrées,
rien n'est inventé. Uniquement pour les utilisateurs connectés.
"""

from datetime import date, timedelta

from services import auth as auth_service

# Points attribués selon le type d'activité terminée.
POINTS_PAR_TYPE = {
    "cours": 5,
    "quiz": 10,
    "jeu": 8,
    "quiz_document": 10,
    "concours": 5,
}


def enregistrer_activite(
    id_utilisateur: str,
    type_activite: str,
    matiere: str | None = None,
    sujet: str | None = None,
    score: int | None = None,
    total: int | None = None,
    classe: str | None = None,
) -> dict:
    client = auth_service.obtenir_client()

    client.table("historique_apprentissage").insert({
        "user_id": id_utilisateur,
        "type_activite": type_activite,
        "matiere": matiere,
        "sujet": sujet,
        "score": score,
        "total": total,
        "classe": classe,
    }).execute()

    # met à jour les points et la série de jours actifs sur le profil
    profil = client.table("profils").select("*").eq("id", id_utilisateur).single().execute().data
    points_gagnes = POINTS_PAR_TYPE.get(type_activite, 5)
    nouveaux_points = (profil.get("points") or 0) + points_gagnes

    aujourd_hui = date.today()
    brut = profil.get("derniere_activite")
    derniere_date = date.fromisoformat(brut) if brut else None

    if derniere_date == aujourd_hui:
        nouvelle_serie = profil.get("serie_actuelle") or 1
    elif derniere_date == aujourd_hui - timedelta(days=1):
        nouvelle_serie = (profil.get("serie_actuelle") or 0) + 1
    else:
        nouvelle_serie = 1

    client.table("profils").update({
        "points": nouveaux_points,
        "serie_actuelle": nouvelle_serie,
        "derniere_activite": aujourd_hui.isoformat(),
    }).eq("id", id_utilisateur).execute()

    return {"points": nouveaux_points, "serie_actuelle": nouvelle_serie}


def obtenir_historique(id_utilisateur: str, limite: int = 20) -> list[dict]:
    client = auth_service.obtenir_client()
    reponse = (
        client.table("historique_apprentissage")
        .select("*")
        .eq("user_id", id_utilisateur)
        .order("date_activite", desc=True)
        .limit(limite)
        .execute()
    )
    return reponse.data


def obtenir_stats(id_utilisateur: str) -> dict:
    client = auth_service.obtenir_client()
    historique = (
        client.table("historique_apprentissage")
        .select("*")
        .eq("user_id", id_utilisateur)
        .execute()
        .data
    )

    seances = len(historique)
    notes = [h for h in historique if h.get("total")]
    score_moyen = round(sum(h["score"] / h["total"] * 100 for h in notes) / len(notes)) if notes else None

    matieres: dict[str, int] = {}
    for h in historique:
        nom = h.get("matiere") or "Autre"
        matieres[nom] = matieres.get(nom, 0) + 1

    return {"seances": seances, "score_moyen": score_moyen, "matieres": matieres}


def obtenir_maitrise(id_utilisateur: str, classe: str | None) -> list[dict]:
    """
    Regroupe l'historique réel par (matière, sujet) et calcule un niveau de
    maîtrise à partir des vrais scores obtenus — jamais de chiffre inventé.
    Sans quiz sur un sujet, il est classé "non_teste" plutôt que noté au hasard.
    """
    client = auth_service.obtenir_client()
    requete = client.table("historique_apprentissage").select("*").eq("user_id", id_utilisateur)
    if classe:
        requete = requete.eq("classe", classe)
    historique = requete.execute().data

    groupes: dict[tuple, dict] = {}
    for h in historique:
        cle = (h.get("matiere") or "Autre", h.get("sujet") or "Général")
        groupe = groupes.setdefault(cle, {"scores": [], "vues": 0})
        groupe["vues"] += 1
        if h.get("total"):
            groupe["scores"].append(h["score"] / h["total"])

    resultat = []
    for (matiere, sujet), data in groupes.items():
        if data["scores"]:
            moyenne = sum(data["scores"]) / len(data["scores"])
            if moyenne >= 0.8:
                niveau = "maitrise"
            elif moyenne >= 0.5:
                niveau = "en_cours"
            else:
                niveau = "a_retravailler"
        else:
            moyenne, niveau = None, "non_teste"
        resultat.append({
            "matiere": matiere, "sujet": sujet, "moyenne": moyenne,
            "niveau": niveau, "vues": data["vues"],
        })
    return sorted(resultat, key=lambda r: (r["moyenne"] is None, r["moyenne"] or 0))
