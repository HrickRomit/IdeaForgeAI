"""Semantic search engine placeholder."""
"""
search_engine.py - Semantic search engine for finding relevant archived projects.
"""
from typing import Any
from app.services.ai_service.embeddings import get_embedding
from app.services.ai_service.chroma_client import get_archived_projects_collection

__all__ = ["search_projects"]

def search_projects(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    """
    Takes a natural language search query, embeds it, and queries ChromaDB
    for the most semantically relevant archived projects.
    """
    query_vector = get_embedding(query)
    collection = get_archived_projects_collection()

    # Perform the vector search
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    formatted_results = []
    if not results or not results.get("ids") or len(results["ids"][0]) == 0:
        return formatted_results

    for i in range(len(results["ids"][0])):
        formatted_results.append({
            "project_id": results["ids"][0][i],
            "document": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance_score": results["distances"][0][i]
        })

    return formatted_results
