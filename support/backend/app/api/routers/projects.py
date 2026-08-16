import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.services.ai_service.search_engine import search_projects

router = APIRouter(prefix="/projects", tags=["Projects"])


def _get_kb_projects_dir() -> Path:
    base = Path(__file__).resolve().parents[3] / "knowledge_base" / "projects"
    if base.exists():
        return base
    cwd_path = Path("knowledge_base/projects")
    if cwd_path.exists():
        return cwd_path
    alt = Path("support/backend/knowledge_base/projects")
    if alt.exists():
        return alt
    return base


def _flatten_technologies(tech_data: Any) -> list[str]:
    if isinstance(tech_data, list):
        return [str(t) for t in tech_data if t]
    if isinstance(tech_data, dict):
        result = []
        for val in tech_data.values():
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, dict) and "name" in item:
                        result.append(item["name"])
                    elif isinstance(item, str):
                        result.append(item)
            elif isinstance(val, str):
                result.append(val)
        # Unique while preserving insertion order
        seen = set()
        unique_result = []
        for t in result:
            if t not in seen:
                seen.add(t)
                unique_result.append(t)
        return unique_result
    return []


def _normalize_kb_project(raw: dict[str, Any]) -> dict[str, Any]:
    basic = raw.get("basic_information") or {}
    academic = raw.get("academic_information") or {}
    difficulty = raw.get("difficulty") or {}
    research_area = raw.get("research_area") or {}
    supervisor_data = academic.get("supervisor") or {}
    supervisor_name = (
        supervisor_data.get("name")
        if isinstance(supervisor_data, dict)
        else str(supervisor_data or "")
    )

    technologies = _flatten_technologies(raw.get("technologies"))
    if not technologies and isinstance(basic.get("technology_stack"), list):
        technologies = basic.get("technology_stack")

    outcomes = (
        raw.get("expected_outcomes")
        or raw.get("objectives", {}).get("primary")
        or [
            "Role-based capstone tracking and evaluation",
            "Automated record cataloging and indexing",
            "High accuracy similarity and search detection",
        ]
    )

    gap_data = raw.get("future_scope") or raw.get("limitations") or (
        "Future scope notes potential for domain-specific LLM fine-tuning, real-time collaboration, and predictive analytics."
    )
    gap_str = " ".join(gap_data) if isinstance(gap_data, list) else str(gap_data)

    clean_raw = {k: v for k, v in raw.items() if k != "_normalized"}
    return {
        "id": raw.get("project_id") or basic.get("slug") or "project_archive",
        "project_id": raw.get("project_id") or basic.get("slug") or "project_archive",
        "title": basic.get("title") or raw.get("title") or "Archived Project",
        "short_title": basic.get("short_title") or basic.get("title") or "",
        "summary": basic.get("summary") or raw.get("abstract") or "",
        "abstract": raw.get("abstract") or basic.get("summary") or "",
        "problem_statement": raw.get("problem_statement") or "",
        "department": academic.get("department") or "Computer Science and Engineering",
        "academic_year": academic.get("academic_year") or "2025-2026",
        "year": academic.get("academic_year") or "2025-2026",
        "semester": str(academic.get("semester") or "Fall").capitalize(),
        "difficulty": str(difficulty.get("level") or "Intermediate").capitalize(),
        "difficultyScore": difficulty.get("score") or 7,
        "difficulty_score": difficulty.get("score") or 7,
        "supervisor": supervisor_name or "Faculty Advisor",
        "supervisor_name": supervisor_name or "Faculty Advisor",
        "domain": research_area.get("primary") or "Academic Systems",
        "technologies": technologies,
        "keywords": raw.get("keywords") or [],
        "outcomes": outcomes,
        "expected_outcomes": outcomes,
        "gap": gap_str,
        "future_scope": raw.get("future_scope") or [gap_str],
        "limitations": raw.get("limitations") or [],
        "scope": raw.get("scope") or {},
        "features": raw.get("features") or [],
        "modules": raw.get("modules") or [],
        "algorithms": raw.get("algorithms") or [],
        "estimated_duration": raw.get("estimated_duration") or {},
        "team_size": raw.get("team_size") or {},
        "authors": academic.get("authors") or [],
        "raw_data": clean_raw,
    }


def _load_all_kb_projects() -> list[dict[str, Any]]:
    kb_dir = _get_kb_projects_dir()
    if not kb_dir.exists():
        return []

    projects = []
    json_paths = sorted(kb_dir.glob("*/project.json"))
    for path in json_paths:
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                projects.append(_normalize_kb_project(data))
        except Exception:
            continue
    return projects


def _find_kb_project(project_id: str) -> dict[str, Any] | None:
    kb_dir = _get_kb_projects_dir()
    clean_id = project_id.strip().lower()

    # 1. Direct folder check (e.g. "project_0001")
    direct_path = kb_dir / clean_id / "project.json"
    if direct_path.exists():
        try:
            with open(direct_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # 2. Number check e.g. "1" -> "project_0001" or "archive_1"
    digits = "".join(filter(str.isdigit, clean_id))
    if digits:
        try:
            num_str = f"project_{int(digits):04d}"
            path = kb_dir / num_str / "project.json"
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            pass

    # 3. Check all project.json files for matching project_id, slug, or title
    for path in kb_dir.glob("*/project.json"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                pid = str(data.get("project_id", "")).lower()
                slug = str(data.get("basic_information", {}).get("slug", "")).lower()
                title = str(data.get("basic_information", {}).get("title", "")).lower()
                if (
                    pid == clean_id
                    or slug == clean_id
                    or clean_id in pid
                    or clean_id in slug
                    or clean_id == title
                ):
                    return data
        except Exception:
            continue
    return None


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
    semester: str | None,
) -> bool:
    if not _is_all_filter(department):
        stored_department = str(metadata.get("department", "")).strip()
        expected_department = _normalize_department(department)
        actual_department = _normalize_department(stored_department)
        if stored_department and actual_department != expected_department:
            return False

    if not _is_all_filter(year):
        stored_year = str(
            metadata.get("academic_year") or metadata.get("year") or ""
        ).strip()
        if stored_year and stored_year.lower() != year.strip().lower():
            return False

    if not _is_all_filter(semester):
        stored_semester = str(metadata.get("semester", "")).strip()
        if stored_semester and stored_semester.lower() != semester.strip().lower():
            return False

    return True


def _normalize_department(value: str | None) -> str:
    normalized = str(value or "").strip().lower()
    aliases = {
        "computer science": "cse",
        "computer science and engineering": "cse",
        "cse": "cse",
        "electrical and electronic engineering": "eee",
        "electrical engineering": "eee",
        "eee": "eee",
        "civil and environment engineering": "cee",
        "civil engineering": "cee",
        "mechanical engineering": "me",
        "me": "me",
    }
    return aliases.get(normalized, normalized)


@router.get("", response_model=list[dict[str, Any]])
def get_all_projects(
    department: str | None = Query(default=None),
    year: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    """
    Returns all archived projects normalized from the knowledge base.
    """
    all_projects = _load_all_kb_projects()
    filtered = []
    for p in all_projects:
        if department and not _is_all_filter(department):
            if _normalize_department(p.get("department")) != _normalize_department(department):
                continue
        if year and not _is_all_filter(year):
            if str(p.get("year", "")).lower() != year.strip().lower():
                continue
        if difficulty and not _is_all_filter(difficulty):
            if str(p.get("difficulty", "")).lower() != difficulty.strip().lower():
                continue
        filtered.append(p)
    return filtered


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
    semester: str | None = Query(default=None, max_length=20),
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    """
    Searches the ChromaDB archive using semantic/vector search.
    """
    del db, current_user

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
            semester=semester,
        )
    ]

    return SearchResponse(
        query=q.strip(),
        total=len(results),
        results=results,
    )


@router.get("/{project_id}", response_model=dict[str, Any])
def get_project_details(project_id: str) -> dict[str, Any]:
    """
    Returns the complete, raw and enriched project.json dictionary for a specific archived project.
    """
    raw_data = _find_kb_project(project_id)
    if raw_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Archived project '{project_id}' not found.",
        )
    # Also attach normalized convenience fields
    normalized = _normalize_kb_project(raw_data)
    clean_raw = {k: v for k, v in raw_data.items() if k != "_normalized"}
    return {
        **clean_raw,
        "_normalized": normalized,
    }

