from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.services.ai_service.search_engine import search_projects

router = APIRouter(prefix="/projects", tags=["Projects"])


class SearchResult(BaseModel):
    project_id: str
    document: str
    metadata: dict[str, Any]
    distance_score: float


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResult]


def _is_all_filter(value: str | None) -> bool:
    return value is None or not value.strip() or value.strip().lower().startswith("all ")


def _matches_filter(
    metadata: dict[str, Any],
    department: str | None,
    year: str | None,
    difficulty: str | None,
) -> bool:
    """
    Filters results when that metadata exists.

    The current Chroma archive stores title, academic_year, and keywords.
    If a record does not yet contain department/difficulty metadata, it is
    kept in the result instead of being wrongly removed.
    """
    if not _is_all_filter(department):
        stored_department = str(metadata.get("department", "")).strip()
        if stored_department and stored_department.lower() != department.strip().lower():
            return False

    if not _is_all_filter(year):
        stored_year = str(
            metadata.get("academic_year") or metadata.get("year") or ""
        ).strip()
        if stored_year and stored_year.lower() != year.strip().lower():
            return False

    if not _is_all_filter(difficulty):
        stored_difficulty = str(metadata.get("difficulty", "")).strip()
        if stored_difficulty and stored_difficulty.lower() != difficulty.strip().lower():
            return False

    return True


@router.get("/search", response_model=SearchResponse)
def search_archived_projects(
    q: str = Query(
        ...,
        min_length=2,
        max_length=300,
        description="Natural-language project search query",
    ),
    top_k: int = Query(default=6, ge=1, le=20),
    department: str | None = Query(default=None, max_length=120),
    year: str | None = Query(default=None, max_length=30),
    difficulty: str | None = Query(default=None, max_length=50),
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    """
    Searches the ChromaDB archive using semantic/vector search.

    Any logged-in user can search the archive.
    """
    del db, current_user  # Dependencies enforce authentication and DB availability.

    try:
        raw_results = search_projects(q.strip(), top_k=top_k)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Archive search is temporarily unavailable. Please try again.",
        ) from error

    results = [
        SearchResult(
            project_id=str(item["project_id"]),
            document=str(item.get("document") or ""),
            metadata=item.get("metadata") or {},
            distance_score=float(item.get("distance_score", 0)),
        )
        for item in raw_results
        if _matches_filter(
            item.get("metadata") or {},
            department=department,
            year=year,
            difficulty=difficulty,
        )
    ]

    return SearchResponse(
        query=q.strip(),
        total=len(results),
        results=results,
    )