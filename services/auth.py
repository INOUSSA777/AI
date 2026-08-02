"""
Service de comptes utilisateurs et de progression, via Supabase.

Contrairement à services/chat_ai.py (qui parle aux IA), ce fichier gère
tout ce qui doit être RÉEL et PERMANENT : inscription, connexion, points,
série de jours, historique de séances. Rien n'est inventé ici — si Supabase
n'est pas configuré, les fonctions lèvent une erreur claire plutôt que de
renvoyer de fausses données.
"""

import os

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

_client: Client | None = None


def obtenir_client() -> Client:
    """Crée (une seule fois) et renvoie le client Supabase."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError(
                "Supabase n'est pas configuré : ajoute SUPABASE_URL et "
                "SUPABASE_ANON_KEY dans le fichier .env."
            )
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def inscrire(email: str, mot_de_passe: str) -> dict:
    """Crée un compte. Renvoie le jeton de session si la création réussit."""
    client = obtenir_client()
    reponse = client.auth.sign_up({"email": email, "password": mot_de_passe})
    if reponse.session is None:
        # Certains projets Supabase exigent une confirmation par email avant
        # de délivrer une session — dans ce cas on le signale clairement.
        return {"confirmation_requise": True}
    # Crée la ligne de profil associée (points/série démarrent à zéro).
    client.table("profils").insert({
        "id": reponse.user.id,
        "points": 0,
        "serie_actuelle": 0,
    }).execute()
    return {
        "confirmation_requise": False,
        "jeton": reponse.session.access_token,
        "email": reponse.user.email,
    }


def connecter(email: str, mot_de_passe: str) -> dict:
    """Connecte un compte existant. Renvoie le jeton de session."""
    client = obtenir_client()
    reponse = client.auth.sign_in_with_password({"email": email, "password": mot_de_passe})
    return {"jeton": reponse.session.access_token, "email": reponse.user.email}


def envoyer_lien_reinitialisation(email: str, url_retour: str) -> None:
    """Envoie l'email Supabase de réinitialisation (contient à la fois un lien et un code)."""
    client = obtenir_client()
    client.auth.reset_password_for_email(email, {"redirect_to": url_retour})


def verifier_code_et_definir_mot_de_passe(email: str, code: str, nouveau_mot_de_passe: str) -> None:
    """
    Vérifie le code à 6 chiffres reçu par email et définit directement le
    nouveau mot de passe — alternative au lien cliquable, plus simple pour
    l'utilisateur (rien à cliquer, juste un code à retaper).
    """
    client = obtenir_client()
    reponse = client.auth.verify_otp({"email": email, "token": code, "type": "recovery"})
    client.auth.set_session(reponse.session.access_token, reponse.session.refresh_token)
    client.auth.update_user({"password": nouveau_mot_de_passe})


def definir_nouveau_mot_de_passe(access_token: str, refresh_token: str, nouveau_mot_de_passe: str) -> None:
    """
    Utilise le jeton reçu par email (lien de réinitialisation) pour définir
    un nouveau mot de passe sur le compte correspondant.
    """
    client = obtenir_client()
    client.auth.set_session(access_token, refresh_token)
    client.auth.update_user({"password": nouveau_mot_de_passe})


def utilisateur_depuis_jeton(jeton: str):
    """Vérifie un jeton et renvoie l'utilisateur correspondant (ou None)."""
    client = obtenir_client()
    try:
        reponse = client.auth.get_user(jeton)
        return reponse.user
    except Exception:
        return None


def obtenir_profil(id_utilisateur: str) -> dict:
    """Renvoie le profil (points, série) réel de l'utilisateur."""
    client = obtenir_client()
    reponse = client.table("profils").select("*").eq("id", id_utilisateur).single().execute()
    return reponse.data
