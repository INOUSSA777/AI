"""
Service de la Bibliothèque partagée : documents réels, stockés pour de vrai
(Supabase Storage) et catalogués dans une table (Supabase). Deux origines
possibles pour un document :
- "utilisateur" : uploadé par un utilisateur connecté, sous sa responsabilité
  (il doit posséder les droits de partager ce qu'il envoie)
- "domaine_public" : œuvre dont les droits d'auteur sont expirés (ajoutée
  manuellement, jamais générée automatiquement pour éviter tout risque
  d'erreur sur le statut réel des droits)
"""

from services import auth as auth_service

NOM_BUCKET = "documents"


def lister_documents(categorie: str | None = None, concours: str | None = None) -> list[dict]:
    client = auth_service.obtenir_client()
    requete = client.table("documents_bibliotheque").select("*").order("date_ajout", desc=True)
    if categorie and categorie != "Tous":
        requete = requete.eq("categorie", categorie)
    if concours:
        requete = requete.eq("concours", concours)
    reponse = requete.execute()
    return reponse.data


def uploader_et_cataloguer(
    id_utilisateur: str,
    nom_affiche: str,
    categorie: str,
    nom_fichier: str,
    contenu: bytes,
    type_mime: str,
    concours: str | None = None,
) -> dict:
    client = auth_service.obtenir_client()

    chemin_storage = f"{id_utilisateur}/{nom_fichier}"
    client.storage.from_(NOM_BUCKET).upload(
        chemin_storage,
        contenu,
        file_options={"content-type": type_mime, "upsert": "true"},
    )
    url_publique = client.storage.from_(NOM_BUCKET).get_public_url(chemin_storage)

    ligne = {
        "nom": nom_affiche,
        "categorie": categorie,
        "concours": concours or None,
        "origine": "utilisateur",
        "uploaded_by": id_utilisateur,
        "chemin_fichier": chemin_storage,
        "url_fichier": url_publique,
        "taille_octets": len(contenu),
    }
    reponse = client.table("documents_bibliotheque").insert(ligne).execute()
    return reponse.data[0]


def supprimer_document(id_document: str, id_utilisateur: str) -> None:
    """Un utilisateur ne peut supprimer que ses propres documents uploadés."""
    client = auth_service.obtenir_client()
    doc = client.table("documents_bibliotheque").select("*").eq("id", id_document).single().execute().data
    if not doc or doc["uploaded_by"] != id_utilisateur:
        raise PermissionError("Tu ne peux supprimer que tes propres documents.")
    client.storage.from_(NOM_BUCKET).remove([doc["chemin_fichier"]])
    client.table("documents_bibliotheque").delete().eq("id", id_document).execute()
