"""
similarity_engine.py - Similarity detection engine for proposals against archived projects.
"""
from typing import Any
from app.services.ai_service.embeddings import get_embedding
from app.services.ai_service.chroma_client import get_archived_projects_collection

__all__ = ["check_proposal_similarity"]


def check_proposal_similarity(
    title: str,
    abstract: str = "",
    problem_statement: str | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    """
    Computes vector similarity between a student's proposal and archived projects in ChromaDB.

    Args:
        title: Title of the proposal.
        abstract: Abstract text describing the proposal.
        problem_statement: Optional problem statement text.
        top_k: Number of top similar archived projects to retrieve.

    Returns:
        A dictionary containing overall_similarity_score (0.0 to 1.0) and top match details.
    """
    # 1. Combine proposal text fields into a single comprehensive query text
    proposal_text = f"Title: {title}"
    if abstract:
        proposal_text += f"\nAbstract: {abstract}"
    if problem_statement:
        proposal_text += f"\nProblem Statement: {problem_statement}"

    # 2. Convert text to vector embedding
    query_vector = get_embedding(proposal_text)

    # 3. Retrieve ChromaDB vector collection
    try:
        collection = get_archived_projects_collection()
        count = collection.count()
        if count == 0:
            return {
                "overall_similarity_score": 0.0,
                "total_matches_found": 0,
                "matches": [],
            }

        # 4. Perform vector similarity query
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=min(top_k, count),
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        return {
            "overall_similarity_score": 0.0,
            "total_matches_found": 0,
            "matches": [],
        }

    matches: list[dict[str, Any]] = []
    highest_score = 0.0

    if results and results.get("ids") and len(results["ids"][0]) > 0:
        ids = results["ids"][0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i in range(len(ids)):
            dist = distances[i] if i < len(distances) else 1.0

            # Normalize distance to similarity score range [0.0, 1.0]
            raw_sim = 1.0 - (dist / 2.0 if dist > 1.0 else dist)
            sim_score = max(0.0, min(1.0, round(raw_sim, 4)))

            if sim_score > highest_score:
                highest_score = sim_score

            meta = metadatas[i] if i < len(metadatas) else {}
            doc = documents[i] if i < len(documents) else ""

            matches.append({
                "archived_project_id": ids[i],
                "title": meta.get("title", "Archived Project"),
                "similarity_score": sim_score,
                "matched_sections": "Abstract & Problem Domain",
                "document_snippet": doc[:250] + "..." if len(doc) > 250 else doc,
                "metadata": meta,
            })

    return {
        "overall_similarity_score": highest_score,
        "total_matches_found": len(matches),
        "matches": matches,
    }
