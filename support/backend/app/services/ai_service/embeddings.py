"""
embeddings.py - Global Embedding model singleton.
"""
from sentence_transformers import SentenceTransformer

_embedding_model = None

def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model

def get_embedding(text: str) -> list[float]:
    model = get_embedding_model()
    return model.encode(text).tolist()
