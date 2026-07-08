"""Faculty router placeholder."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_role
from app.models.proposal import Proposal
from app.models.review import Review
from app.models.user import User

router = APIRouter(prefix="/faculty", tags=["Faculty"])


class FacultyProposalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    abstract: str
    status: str
    student_id: int
    supervisor_id: int | None = None


class ReviewCreate(BaseModel):
    decision: str
    comments: str | None = None


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    decision: str
    comments: str | None = None
    proposal_id: int
    reviewer_id: int


@router.get("/queue", response_model=list[FacultyProposalRead])
def review_queue(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> list[Proposal]:
    return (
        db.query(Proposal)
        .filter(Proposal.supervisor_id == current_user.id)
        .order_by(Proposal.created_at.desc())
        .all()
    )


@router.post("/proposals/{proposal_id}/reviews", response_model=ReviewRead)
def review_proposal(
    proposal_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> Review:
    proposal = db.get(Proposal, proposal_id)

    if not proposal or proposal.supervisor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    review = Review(
        proposal_id=proposal.id,
        reviewer_id=current_user.id,
        decision=payload.decision,
        comments=payload.comments,
    )

    proposal.status = payload.decision.lower()

    db.add(review)
    db.commit()
    db.refresh(review)
    return review