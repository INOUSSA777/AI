"""
Service des ressources ajoutées manuellement par matière/classe :
- vidéos (lien externe déjà en ligne, ou vrai fichier uploadé)
- exercices personnalisés (question/choix/réponse écrits par un utilisateur)

Contrairement au chat, rien ici n'est généré par l'IA : c'est du contenu
réel saisi par un utilisateur connecté, sous sa responsabilité.
"""

from services import auth as auth_service

NOM_BUCKET = "documents"


def ajouter_video_lien(id_utilisateur: str, matiere: str, classe: str, titre: str, url: str) -> dict:
    client = auth_service.obtenir_client()
    ligne = {
        "matiere": matiere, "classe": classe, "titre": titre,
        "type": "lien", "url": url, "uploaded_by": id_utilisateur,
    }
    return client.table("videos_matiere").insert(ligne).execute().data[0]


def ajouter_video_fichier(
    id_utilisateur: str, matiere: str, classe: str, titre: str,
    nom_fichier: str, contenu: bytes, type_mime: str,
) -> dict:
    client = auth_service.obtenir_client()
    chemin_storage = f"{id_utilisateur}/videos/{nom_fichier}"
    client.storage.from_(NOM_BUCKET).upload(
        chemin_storage, contenu, file_options={"content-type": type_mime, "upsert": "true"}
    )
    url_publique = client.storage.from_(NOM_BUCKET).get_public_url(chemin_storage)

    ligne = {
        "matiere": matiere, "classe": classe, "titre": titre,
        "type": "fichier", "url": url_publique, "chemin_fichier": chemin_storage,
        "uploaded_by": id_utilisateur,
    }
    return client.table("videos_matiere").insert(ligne).execute().data[0]


def lister_videos(matiere: str | None, classe: str | None) -> list[dict]:
    client = auth_service.obtenir_client()
    requete = client.table("videos_matiere").select("*").order("date_creation", desc=True)
    if matiere:
        requete = requete.eq("matiere", matiere)
    if classe:
        requete = requete.eq("classe", classe)
    return requete.execute().data


def ajouter_exercice(
    id_utilisateur: str, matiere: str, classe: str, question: str,
    choix: list[str], reponse_index: int, explication: str,
) -> dict:
    client = auth_service.obtenir_client()
    ligne = {
        "matiere": matiere, "classe": classe, "question": question,
        "choix": choix, "reponse_index": reponse_index, "explication": explication,
        "cree_par": id_utilisateur,
    }
    return client.table("exercices_personnalises").insert(ligne).execute().data[0]


def lister_exercices(matiere: str | None, classe: str | None) -> list[dict]:
    client = auth_service.obtenir_client()
    requete = client.table("exercices_personnalises").select("*").order("date_creation", desc=True)
    if matiere:
        requete = requete.eq("matiere", matiere)
    if classe:
        requete = requete.eq("classe", classe)
    return requete.execute().data


def obtenir_stats_enseignant(id_utilisateur: str) -> dict:
    """
    Statistiques réelles des ressources qu'un enseignant a lui-même ajoutées
    (vidéos + exercices) — jamais de chiffre agrégé sur toute la plateforme,
    uniquement ce que CET utilisateur a personnellement créé.
    """
    client = auth_service.obtenir_client()
    videos = client.table("videos_matiere").select("*").eq("uploaded_by", id_utilisateur).execute().data
    exercices = client.table("exercices_personnalises").select("*").eq("cree_par", id_utilisateur).execute().data

    par_classe: dict[str, dict] = {}
    for v in videos:
        cle = v.get("classe") or "Non précisé"
        par_classe.setdefault(cle, {"videos": 0, "exercices": 0})
        par_classe[cle]["videos"] += 1
    for e in exercices:
        cle = e.get("classe") or "Non précisé"
        par_classe.setdefault(cle, {"videos": 0, "exercices": 0})
        par_classe[cle]["exercices"] += 1

    return {
        "total_videos": len(videos),
        "total_exercices": len(exercices),
        "par_classe": [{"classe": c, **v} for c, v in par_classe.items()],
        "dernieres_videos": sorted(videos, key=lambda v: v.get("date_creation") or "", reverse=True)[:5],
        "derniers_exercices": sorted(exercices, key=lambda e: e.get("date_creation") or "", reverse=True)[:5],
    }
