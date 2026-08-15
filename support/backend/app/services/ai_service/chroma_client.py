import logging
import os
import chromadb
from chromadb.api.models.Collection import Collection
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
_client = None

def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        try:
            client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
            client.heartbeat()
            _client = client
        except Exception as e:
            logger.warning(
                f"Could not connect to Chroma HTTP client at {settings.chroma_host}:{settings.chroma_port}. "
                f"Falling back to embedded PersistentClient ('./chroma_db'). Error: {e}"
            )
            os.makedirs("./chroma_db", exist_ok=True)
            _client = chromadb.PersistentClient(path="./chroma_db")
    return _client

def get_archived_projects_collection() -> Collection:
    client = get_chroma_client()
    return client.get_or_create_collection(
        name="archived_projects",
        metadata={"description": "Embeddings for archived academic projects"}
    )
