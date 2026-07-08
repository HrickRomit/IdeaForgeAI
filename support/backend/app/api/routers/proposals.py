"""Proposal router placeholder."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_role
from app.models.proposal import Proposal
from app.models.user import User

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