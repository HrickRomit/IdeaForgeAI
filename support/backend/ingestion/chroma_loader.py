"""
chroma_loader.py - load into ChromaDB
"""
import chromadb
import json

__all__ = ["load_to_chroma"]

def load_to_chroma(project_data: dict, document_text: str, embedding: list[float], chroma_client: chromadb.ClientAPI = None) -> str:
    """
    Store embedding, searchable document, and minimal metadata in ChromaDB
    using project_id as the identifier.
    """
    project_id = project_data.get("project_id")
    if not project_id:
        raise ValueError("Missing project_id in project data.")

    # Connect to the ChromaDB instance if a client isn't provided
    if chroma_client is None:
        # Matches the docker-compose setup
        chroma_client = chromadb.HttpClient(host="localhost", port=8001)

    # Get or create the collection specifically for archived projects
    collection = chroma_client.get_or_create_collection(
        name="archived_projects",
        metadata={"description": "Embeddings for archived academic projects"}
    )

    # Extract basic metadata to allow for hybrid search filtering later
    basic_info = project_data.get("basic_information", {})

    # Note: ChromaDB metadata values must be strings, ints, or floats
    metadata = {
        "title": basic_info.get("title", ""),
        "project_type": basic_info.get("project_type", ""),
        "academic_year": project_data.get("academic_information", {}).get("academic_year", ""),
        "keywords": json.dumps(project_data.get("keywords", []))  # Serialize list to string
    }

    # Upsert inserts the document if it's new, or updates it if it already exists
    collection.upsert(
        ids=[project_id],
        embeddings=[embedding],
        documents=[document_text],
        metadatas=[metadata]
    )

    return project_id
