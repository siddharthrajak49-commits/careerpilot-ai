from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

print("\nAVAILABLE GEMINI MODELS:\n")

try:

    for model in genai.list_models():

        name = model.name

        methods = model.supported_generation_methods

        if "generateContent" in methods:

            print(f"✅ {name}")

except Exception as e:

    print("ERROR:", e)