"""
Notifications push réelles, via le standard Web Push (VAPID). Utilisé pour
l'instant pour les rappels de fiches à réviser — un vrai envoi, pas juste un
bandeau dans l'appli.
"""

import json
import os

from pywebpush import WebPushException, webpush

from services import auth as auth_service

VAPID_CLE_PRIVEE = os.getenv("VAPID_PRIVATE_KEY", "")
VAPID_EMAIL_CONTACT = os.getenv("VAPID_CONTACT_EMAIL", "mailto:contact@inous.ai")


def enregistrer_abonnement(id_utilisateur: str, abonnement: dict) -> dict:
    client = auth_service.obtenir_client()
    ligne = {"user_id": id_utilisateur, "abonnement": abonnement}
    return client.table("abonnements_push").upsert(ligne, on_conflict="user_id").execute().data[0]


def envoyer_notification(id_utilisateur: str, titre: str, corps: str) -> bool:
    if not VAPID_CLE_PRIVEE:
        return False
    client = auth_service.obtenir_client()
    ligne = (
        client.table("abonnements_push").select("*").eq("user_id", id_utilisateur)
        .single().execute().data
    )
    if not ligne:
        return False
    try:
        webpush(
            subscription_info=ligne["abonnement"],
            data=json.dumps({"titre": titre, "corps": corps}),
            vapid_private_key=VAPID_CLE_PRIVEE,
            vapid_claims={"sub": VAPID_EMAIL_CONTACT},
        )
        return True
    except WebPushException:
        return False
