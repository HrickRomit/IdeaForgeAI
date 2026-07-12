"""
chroma_client.py - ChromaDB connection and query utilities.
"""
import chromadb
from chromadb.api.models.Collection import Collection
from app.core.config import get_settings

settings = get_settings()
_client = None

def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
    return _client

def get_archived_projects_collection() -> Collection:
    client = get_chroma_client()
    return client.get_or_create_collection(
        name="archived_projects",
        metadata={"description": "Embeddings for archived academic projects"}
    )
