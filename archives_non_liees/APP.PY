import streamlit as st
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

st.title("🤖 INOUS.AI – Assistant Intelligent 7B")
st.write("Parle avec ton IA naturelle et cohérente !")

@st.cache_resource
def load_model():
    model_name = "Qwen/Qwen2.5-7B-Instruct"  # modèle instruct
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,
        device_map="cpu"  # ton PC n'a pas de GPU
    )
    return tokenizer, model

tokenizer, model = load_model()

user_input = st.text_input("💬 Toi :", placeholder="Écris ici...")

if st.button("Envoyer"):
    if user_input.strip():
        with st.spinner("🤖 INOUS.AI réfléchit..."):
            prompt = f"Tu es un assistant gentil et intelligent. Réponds clairement :\n\nUtilisateur : {user_input}\nAssistant : "
            inputs = tokenizer(prompt, return_tensors="pt")

            output = model.generate(
                **inputs,
                max_new_tokens=120,
                temperature=0.7,
                do_sample=True,
            )

            response = tokenizer.decode(output[0], skip_special_tokens=True)
            # Extraire uniquement la réponse de l'IA
            if "Assistant :" in response:
                response = response.split("Assistant :")[-1].strip()

        st.success(response)
    else:
        st.warning("Écris un message avant d’envoyer !")

st.markdown("✨ Créé par Inous – Powered by Qwen2.5 7B Instruct")

