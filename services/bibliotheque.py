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
from services import chat_ai

NOM_BUCKET = "documents"

CATEGORIES_VALIDES = ["Cours", "Fiche", "Sujet", "Corrigé", "Annale", "Livre", "Document"]


def extraire_texte_apercu(nom_fichier: str, contenu: bytes) -> str:
    """
    Extrait un aperçu texte d'un fichier pour la classification automatique.
    Renvoie une chaîne vide si le format n'est pas géré (ex : .doc ancien
    format) — dans ce cas la classification retombera sur le nom du fichier.
    """
    extension = nom_fichier.lower().rsplit(".", 1)[-1] if "." in nom_fichier else ""
    try:
        if extension == "pdf":
            texte, _ = chat_ai.extraire_texte_pdf(contenu)
            return texte
        if extension == "txt":
            return contenu.decode("utf-8", errors="ignore")
        if extension == "docx":
            import io

            from docx import Document

            doc = Document(io.BytesIO(contenu))
            return "\n".join(p.text for p in doc.paragraphs[:60])
    except Exception:
        pass
    return ""


def classifier_document(nom_fichier: str, extrait_texte: str) -> str:
    """Demande à l'IA de classer un document selon son contenu réel (ou son nom si pas d'extrait)."""
    base = extrait_texte[:2000].strip() if extrait_texte else f"(pas de contenu lisible, nom du fichier uniquement : {nom_fichier})"
    prompt = (
        f'Nom du fichier : "{nom_fichier}"\n'
        f'Extrait du contenu :\n"""{base}"""\n\n'
        "Classe ce document dans UNE SEULE de ces catégories, selon son contenu réel :\n"
        "- Cours : une leçon, une explication de notion\n"
        "- Fiche : un résumé synthétique, une fiche de révision\n"
        "- Sujet : un énoncé d'examen SANS corrigé\n"
        "- Corrigé : la correction/le corrigé d'un examen\n"
        "- Annale : une épreuve complète (sujet + corrigé ensemble) d'une année précise\n"
        "- Livre : un roman ou un ouvrage\n"
        "- Document : si aucune des catégories précédentes ne convient\n\n"
        "Réponds UNIQUEMENT avec le nom exact de la catégorie choisie, sans rien d'autre."
    )
    reponse = chat_ai.chat_response(prompt, historique=None, langue="fr", structuree=False)
    reponse_nettoyee = reponse.strip().strip('."\'').lower()
    for categorie in CATEGORIES_VALIDES:
        if categorie.lower() in reponse_nettoyee:
            return categorie
    return "Document"  # repli si l'IA répond quelque chose d'inattendu


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
