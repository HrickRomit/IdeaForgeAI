"""Gemini client placeholder."""
import os 
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import get_settings

settings = get_settings()

_llm = None

def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        # Fallback to os.environ if it's missing from settings
        api_key = getattr(settings, "gemini_api_key", os.getenv("GEMINI_API_KEY"))
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in your .env file!")
            
        # We use gemini-1.5-flash for incredibly fast and cheap inference
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            google_api_key=api_key,
            temperature=0.3 # Low temperature so it doesn't hallucinate
        )
    return _llm
