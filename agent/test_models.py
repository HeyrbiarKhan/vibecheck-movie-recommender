import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_AI_API_KEY')
if api_key and api_key != 'your_api_key_here':
    genai.configure(api_key=api_key)
    
    print("Available models:")
    for model in genai.list_models():
        print(f"- {model.name}")
else:
    print("No valid API key found. Please set GOOGLE_AI_API_KEY in .env file")
