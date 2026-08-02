from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_role
from app.models.proposal import Proposal
from app.models.user import User
from app.services.file_service import delete_stored_file, save_proposal_pdf

router = APIRouter(prefix="/proposals", tags=["Student Proposals"])


class ProposalPayload(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    abstract: str = Field(min_length=20, max_length=10000)
    problem_statement: str | None = Field(default=None, max_length=10000)
    objectives: str | None = Field(default=None, max_length=10000)
    methodology: str | None = Field(default=None, max_length=10000)
    technology_stack: str | None = Field(default=None, max_length=5000)
    supervisor_id: int | None = Field(default=None, gt=0)

    @field_validator(
        "title",
        "abstract",
        "problem_statement",
        "objectives",
        "methodology",
        "technology_stack",
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
    department_id: int | None = None


def _validate_supervisor(
    db: Session,
    supervisor_id: int | None,
) -> None:
    if supervisor_id is None:
        return

    supervisor = db.get(User, supervisor_id)

    if supervisor is None or supervisor.role != "faculty" or not supervisor.is_active:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Supervisor must be an active faculty user.",
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
    _validate_supervisor(db, payload.supervisor_id)

    proposal = Proposal(
        title=payload.title,
        abstract=payload.abstract,
        problem_statement=payload.problem_statement,
        objectives=payload.objectives,
        methodology=payload.methodology,
        technology_stack=payload.technology_stack,
        supervisor_id=payload.supervisor_id,
        department_id=current_user.department_id,
        student_id=current_user.id,
        status="draft",
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return proposal


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
) -> Proposal:
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

    _validate_supervisor(db, payload.supervisor_id)

    proposal.title = payload.title
    proposal.abstract = payload.abstract
    proposal.problem_statement = payload.problem_statement
    proposal.objectives = payload.objectives
    proposal.methodology = payload.methodology
    proposal.technology_stack = payload.technology_stack
    proposal.supervisor_id = payload.supervisor_id

    db.commit()
    db.refresh(proposal)

    return proposal


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
) -> Proposal:
    _validate_supervisor(db, payload.supervisor_id)

    proposal = Proposal(
        title=payload.title,
        abstract=payload.abstract,
        problem_statement=payload.problem_statement,
        objectives=payload.objectives,
        methodology=payload.methodology,
        technology_stack=payload.technology_stack,
        supervisor_id=payload.supervisor_id,
        department_id=current_user.department_id,
        student_id=current_user.id,
        status="submitted",
        submitted_at=datetime.now(timezone.utc),
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return proposal


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
) -> Proposal:
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

    return proposal


@router.get("/mine", response_model=list[ProposalRead])
def my_proposals(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> list[Proposal]:
    return (
        db.query(Proposal)
        .filter(Proposal.student_id == current_user.id)
        .order_by(Proposal.created_at.desc())
        .all()
    )