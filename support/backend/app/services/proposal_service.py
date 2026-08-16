"""
proposal_service.py - Services for managing student proposals and similarity generation.
"""
import logging
from typing import Any
from sqlalchemy.orm import Session

from app.models.proposal import Proposal
from app.models.similarity_report import SimilarityReport
from app.models.archived_project import ArchivedProject
from app.services.ai_service.similarity_engine import check_proposal_similarity

logger = logging.getLogger(__name__)


def generate_and_save_similarity_reports(
    proposal: Proposal,
    db: Session,
    top_k: int = 5,
) -> list[SimilarityReport]:
    """
    Computes vector similarity for a proposal against ChromaDB and creates/updates
    SimilarityReport records in PostgreSQL.
    """
    if not proposal.title:
        return []

    try:
        sim_result = check_proposal_similarity(
            title=proposal.title,
            abstract=proposal.abstract or "",
            problem_statement=proposal.problem_statement or "",
            top_k=top_k,
        )
    except Exception as e:
        logger.warning("Error running similarity check for proposal %s: %s", proposal.id, e)
        return []

    matches = sim_result.get("matches", [])
    if not matches:
        return []

    # Remove stale reports for this proposal
    db.query(SimilarityReport).filter(SimilarityReport.proposal_id == proposal.id).delete()

    created_reports = []
    for match in matches:
        chroma_id = str(match.get("archived_project_id") or "")
        sim_score = float(match.get("similarity_score", 0.0))
        project_title = match.get("title", "Archived Project")
        snippet = match.get("document_snippet", "")

        # Look up corresponding ArchivedProject in Postgres
        archived_record = None
        if chroma_id:
            archived_record = (
                db.query(ArchivedProject)
                .filter(
                    (ArchivedProject.chroma_document_id == chroma_id)
                    | (ArchivedProject.title == project_title)
                )
                .first()
            )

        report = SimilarityReport(
            proposal_id=proposal.id,
            archived_project_id=archived_record.id if archived_record else None,
            similarity_score=sim_score,
            novelty_score=round(1.0 - sim_score, 4),
            matched_sections={
                "title": project_title,
                "snippet": snippet,
                "chroma_id": chroma_id,
            },
            explanation=f"Matches archived project '{project_title}' with {round(sim_score * 100)}% semantic similarity.",
        )
        db.add(report)
        created_reports.append(report)

    try:
        db.commit()
        for r in created_reports:
            db.refresh(r)
    except Exception as e:
        db.rollback()
        logger.warning("Error saving similarity reports for proposal %s: %s", proposal.id, e)

    return created_reports
