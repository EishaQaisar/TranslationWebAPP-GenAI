from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from functools import lru_cache


app = FastAPI(title="Healthcare Translation Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Expanded list of supported languages (ISO 639-1 codes)
SUPPORTED_LANGS = [
    "en", "es", "fr", "de", "ru", "zh", "ar", "hi", "ja", "pt", "it", "nl", "pl", "tr", "sv", "fi", "ko", "uk", "cs"
]

class TranslateIn(BaseModel):
    text: str
    src_lang: str = "en"
    tgt_lang: str = "es"

@lru_cache(maxsize=100)
def model_exists(src, tgt):
    """Check if a direct Helsinki model exists"""
    model_name = f"Helsinki-NLP/opus-mt-{src}-{tgt}"
    url = f"https://huggingface.co/api/models/{model_name}"
    resp = requests.get(url)
    return resp.status_code == 200

def call_hf_model(text, src, tgt):
    model_name = f"Helsinki-NLP/opus-mt-{src}-{tgt}"
    url = f"https://api-inference.huggingface.co/models/{model_name}"
    headers = {}
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"
    resp = requests.post(url, headers=headers, json={"inputs": text})
    if resp.status_code != 200:
        raise ValueError(f"HF inference error {resp.status_code}: {resp.text}")
    data = resp.json()
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return data[0].get("translation_text") or list(data[0].values())[0]
    elif isinstance(data, dict):
        return data.get("translation_text") or next(iter(data.values()))
    return str(data)

@app.post("/translate")
async def translate(payload: TranslateIn):
    text = payload.text.strip()
    src = payload.src_lang.strip().lower()
    tgt = payload.tgt_lang.strip().lower()

    if src not in SUPPORTED_LANGS or tgt not in SUPPORTED_LANGS:
        return {"error": f"Supported languages: {SUPPORTED_LANGS}", "translated_text": ""}

    if not text:
        return {"error": "No text provided", "translated_text": ""}

    try:
        if model_exists(src, tgt):
            translated = call_hf_model(text, src, tgt)
        elif src != "en" and tgt != "en":
            # pivot through English
            intermediate = call_hf_model(text, src, "en")
            translated = call_hf_model(intermediate, "en", tgt)
        else:
            return {"error": f"No translation path for {src} -> {tgt}", "translated_text": ""}
    except Exception as e:
        return {"error": str(e), "translated_text": ""}

    return {"translated_text": translated}
