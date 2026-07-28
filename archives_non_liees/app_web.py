from services.chat_ai import chat_response
import streamlit as st

st.set_page_config(page_title="INOUS.AI", layout="centered")

st.title("🤖 INOUS.AI")
st.write("Assistant intelligent éducatif")

menu = st.selectbox(
    "Choisis un mode",
    ["Chat IA", "Parole IA"]
)


if menu == "Chat IA":
    question = st.text_input("Pose ta question")

    if question:
        reponse = chat_response(question)
        st.success("Réponse de INOUS.AI")
        st.write(reponse)

elif menu == "Parole IA":
    texte = st.text_input("Texte à prononcer")

    if texte:
        st.success("Audio généré")
        st.write("🔊 (audio généré ici)")
