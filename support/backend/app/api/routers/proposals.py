from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from app.api.deps import get_database, require_role
from app.models.proposal import Proposal
from app.models.user import User
from app.services.ai_service.difficulty_engine import analyze_project_difficulty_and_duration
from app.services.ai_service.similarity_engine import check_proposal_similarity
from app.services.file_service import delete_stored_file, save_proposal_pdf
from app.services.proposal_service import generate_and_save_similarity_reports

router = APIRouter(prefix="/proposals", tags=["Student Proposals"])



class ProposalSimilarityPayload(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    abstract: str | None = Field(default="", max_length=10000)
    problem_statement: str | None = Field(default=None, max_length=10000)
    top_k: int = Field(default=5, ge=1, le=20)


class ProposalPayload(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    abstract: str = Field(min_length=20, max_length=10000)
    problem_statement: str | None = Field(default=None, max_length=10000)
    objectives: str | None = Field(default=None, max_length=10000)
    methodology: str | None = Field(default=None, max_length=10000)
    technology_stack: str | None = Field(default=None, max_length=5000)
    supervisor_id: int | None = Field(default=None, gt=0)
    faculty_initial: str | None = Field(default=None, max_length=50)

    @field_validator(
        "title",
        "abstract",
        "problem_statement",
        "objectives",
        "methodology",
        "technology_stack",
        "faculty_initial",
        mode="before",
    )
    @classmethod
    def clean_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Text fields cannot contain only spaces.")

        return value


class ReviewSummaryRead(BaseModel):
    id: int
    decision: str
    comments: str | None = None
    created_at: datetime


class ProposalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    abstract: str
    problem_statement: str | None = None
    objectives: str | None = None
    methodology: str | None = None
    technology_stack: str | None = None
    document_path: str | None = None
    status: str
    student_id: int
    supervisor_id: int | None = None
    supervisor_name: str | None = None
    faculty_initial: str | None = None
    department_id: int | None = None
    faculty_comment: str | None = None
    submitted_at: datetime | None = None
    created_at: datetime | None = None
    reviews: list[ReviewSummaryRead] = Field(default_factory=list)


def _resolve_supervisor_id(
    db: Session,
    supervisor_id: int | None,
    faculty_initial: str | None,
) -> int | None:
    resolved_supervisor_id = supervisor_id

    if faculty_initial:
        supervisor = (
            db.query(User)
            .filter(
                User.role == "faculty",
                User.is_active.is_(True),
                func.lower(User.faculty_id) == faculty_initial.lower(),
            )
            .first()
        )

        if supervisor is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Faculty initial must match an active faculty ID.",
            )

        resolved_supervisor_id = supervisor.id

    if resolved_supervisor_id is None:
        return None

    supervisor = db.get(User, resolved_supervisor_id)

    if supervisor is None or supervisor.role != "faculty" or not supervisor.is_active:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Supervisor must be an active faculty user.",
        )

    return supervisor.id


def _proposal_to_read(proposal: Proposal) -> ProposalRead:
    reviews_list = sorted(proposal.reviews, key=lambda r: r.created_at) if proposal.reviews else []
    latest_comment = reviews_list[-1].comments if reviews_list else None

    return ProposalRead(
        id=proposal.id,
        title=proposal.title,
        abstract=proposal.abstract,
        problem_statement=proposal.problem_statement,
        objectives=proposal.objectives,
        methodology=proposal.methodology,
        technology_stack=proposal.technology_stack,
        document_path=proposal.document_path,
        status=proposal.status,
        student_id=proposal.student_id,
        supervisor_id=proposal.supervisor_id,
        supervisor_name=proposal.supervisor.full_name if proposal.supervisor else None,
        faculty_initial=(
            proposal.supervisor.faculty_id
            if proposal.supervisor is not None
            else None
        ),
        department_id=proposal.department_id,
        faculty_comment=latest_comment,
        submitted_at=proposal.submitted_at,
        created_at=proposal.created_at,
        reviews=[
            ReviewSummaryRead(
                id=r.id,
                decision=r.decision,
                comments=r.comments,
                created_at=r.created_at,
            )
            for r in reviews_list
        ],
    )


def _get_owned_proposal_or_404(
    db: Session,
    proposal_id: int,
    student_id: int,
) -> Proposal:
    proposal = db.get(Proposal, proposal_id)

    if proposal is None or proposal.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found.",
        )

    return proposal


# Create a new saved draft.
@router.post(
    "/drafts",
    response_model=ProposalRead,
    status_code=status.HTTP_201_CREATED,
)
def create_proposal_draft(
    payload: ProposalPayload,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> Proposal:
    supervisor_id = _resolve_supervisor_id(
        db,
        payload.supervisor_id,
        payload.faculty_initial,
    )

    proposal = Proposal(
        title=payload.title,
        abstract=payload.abstract,
        problem_statement=payload.problem_statement,
        objectives=payload.objectives,
        methodology=payload.methodology,
        technology_stack=payload.technology_stack,
        supervisor_id=supervisor_id,
        department_id=current_user.department_id,
        student_id=current_user.id,
        status="draft",
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return _proposal_to_read(proposal)


# Update an existing saved draft.
@router.patch(
    "/{proposal_id}/draft",
    response_model=ProposalRead,
)
def update_proposal_draft(
    proposal_id: int,
    payload: ProposalPayload,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> ProposalRead:
    proposal = _get_owned_proposal_or_404(
        db,
        proposal_id,
        current_user.id,
    )

    if proposal.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only draft proposals can be edited.",
        )

    supervisor_id = _resolve_supervisor_id(
        db,
        payload.supervisor_id,
        payload.faculty_initial,
    )

    proposal.title = payload.title
    proposal.abstract = payload.abstract
    proposal.problem_statement = payload.problem_statement
    proposal.objectives = payload.objectives
    proposal.methodology = payload.methodology
    proposal.technology_stack = payload.technology_stack
    proposal.supervisor_id = supervisor_id

    db.commit()
    db.refresh(proposal)

    return _proposal_to_read(proposal)


# Submit a proposal for faculty review.
@router.post(
    "",
    response_model=ProposalRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_proposal(
    payload: ProposalPayload,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> ProposalRead:
    supervisor_id = _resolve_supervisor_id(
        db,
        payload.supervisor_id,
        payload.faculty_initial,
    )

    proposal = Proposal(
        title=payload.title,
        abstract=payload.abstract,
        problem_statement=payload.problem_statement,
        objectives=payload.objectives,
        methodology=payload.methodology,
        technology_stack=payload.technology_stack,
        supervisor_id=supervisor_id,
        department_id=current_user.department_id,
        student_id=current_user.id,
        status="submitted",
        submitted_at=datetime.now(timezone.utc),
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    # Generate initial similarity report against archive
    try:
        generate_and_save_similarity_reports(proposal, db)
    except Exception:
        pass

    return _proposal_to_read(proposal)


@router.post(
    "/{proposal_id}/document",
    response_model=ProposalRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_proposal_document(
    proposal_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> ProposalRead:
    proposal = _get_owned_proposal_or_404(
        db,
        proposal_id,
        current_user.id,
    )

    old_document_path = proposal.document_path
    new_document_path = await save_proposal_pdf(proposal.id, file)

    proposal.document_path = new_document_path

    try:
        db.commit()
    except Exception:
        db.rollback()
        delete_stored_file(new_document_path)
        raise

    db.refresh(proposal)

    if old_document_path and old_document_path != new_document_path:
        delete_stored_file(old_document_path)

    return _proposal_to_read(proposal)


@router.get("/mine", response_model=list[ProposalRead])
def my_proposals(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> list[ProposalRead]:
    proposals = (
        db.query(Proposal)
        .options(
            joinedload(Proposal.supervisor),
            selectinload(Proposal.reviews),
        )
        .filter(Proposal.student_id == current_user.id)
        .order_by(Proposal.created_at.desc())
        .all()
    )

    return [_proposal_to_read(proposal) for proposal in proposals]


@router.post("/similarity")
def check_similarity(
    payload: ProposalSimilarityPayload,
    current_user: User = Depends(require_role("student")),
) -> dict[str, Any]:
    """
    Checks the similarity of the given proposal draft against the ChromaDB archive.
    """
    try:
        return check_proposal_similarity(
            title=payload.title,
            abstract=payload.abstract,
            problem_statement=payload.problem_statement,
            top_k=payload.top_k,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Similarity engine is temporarily unavailable.",
        ) from error


class ProposalDifficultyPayload(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    abstract: str = Field(min_length=5, max_length=10000)
    problem_statement: str | None = Field(default=None, max_length=10000)
    objectives: str | None = Field(default=None, max_length=10000)
    methodology: str | None = Field(default=None, max_length=10000)
    technology_stack: str | None = Field(default=None, max_length=5000)


class ProposalDifficultyResponse(BaseModel):
    difficulty_score: float
    complexity_tier: str
    estimated_total_hours: int
    estimated_duration_days: int
    daily_work_rate: str = "1 hour per day"
    summary: str
    challenges: list[str]
    prerequisites: list[str]


@router.post("/analyze-difficulty", response_model=ProposalDifficultyResponse)
def analyze_difficulty(
    payload: ProposalDifficultyPayload,
    current_user: User = Depends(require_role("student")),
) -> ProposalDifficultyResponse:
    """
    Analyzes project proposal difficulty score (out of 10) and estimates total duration in days
    assuming the student works 1 hour per day.
    """
    result = analyze_project_difficulty_and_duration(
        proposal_title=payload.title,
        proposal_abstract=payload.abstract,
        proposal_problem=payload.problem_statement,
        tech_stack=payload.technology_stack,
        objectives=payload.objectives,
        methodology=payload.methodology,
    )
    return ProposalDifficultyResponse(**result)

