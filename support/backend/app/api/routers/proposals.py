from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_role
from app.models.proposal import Proposal
from app.models.user import User
from app.services.file_service import delete_stored_file, save_proposal_pdf

router = APIRouter(prefix="/proposals", tags=["Student Proposals"])


class ProposalCreate(BaseModel):
    title: str
    abstract: str
    problem_statement: str | None = None
    objectives: str | None = None
    methodology: str | None = None
    technology_stack: str | None = None
    supervisor_id: int | None = None


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


@router.post("", response_model=ProposalRead)
def submit_proposal(
    payload: ProposalCreate,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> Proposal:
    proposal = Proposal(
        title=payload.title,
        abstract=payload.abstract,
        problem_statement=payload.problem_statement,
        objectives=payload.objectives,
        methodology=payload.methodology,
        technology_stack=payload.technology_stack,
        status="submitted",
        submitted_at=datetime.now(timezone.utc),
        student_id=current_user.id,
        supervisor_id=payload.supervisor_id,
        department_id=current_user.department_id,
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
    """
    Uploads or replaces the logged-in student's proposal PDF document.
    """
    proposal = db.get(Proposal, proposal_id)

    if proposal is None or proposal.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found.",
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

    # Delete the old PDF only after the database successfully uses the new path.
    if old_document_path and old_document_path != new_document_path:
        delete_stored_file(old_document_path)

    return proposal


@router.get("/mine", response_model=list[ProposalRead])
def my_proposals(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("student")),
) -> list[Proposal]:
    return (from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_role
from app.models.proposal import Proposal
from app.models.user import User
from app.services.file_service import delete_stored_file, save_proposal_pdf

router = APIRouter(prefix="/proposals", tags=["Student Proposals"])


class ProposalCreate(BaseModel):
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
    """Ensures the selected supervisor is an active faculty member."""
    if supervisor_id is None:
        return

    supervisor = db.get(User, supervisor_id)

    if supervisor is None or supervisor.role != "faculty" or not supervisor.is_active:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Supervisor must be an active faculty user.",
        )


@router.post("", response_model=ProposalRead, status_code=status.HTTP_201_CREATED)
def submit_proposal(
    payload: ProposalCreate,
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
        status="submitted",
        submitted_at=datetime.now(timezone.utc),
        student_id=current_user.id,
        supervisor_id=payload.supervisor_id,
        department_id=current_user.department_id,
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
    proposal = db.get(Proposal, proposal_id)

    if proposal is None or proposal.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found.",
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
        db.query(Proposal)
        .filter(Proposal.student_id == current_user.id)
        .order_by(Proposal.created_at.desc())
        .all()
    )