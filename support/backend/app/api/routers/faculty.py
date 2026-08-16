from collections import Counter, defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.api.deps import get_database, require_role
from app.models.department import Department
from app.models.notification import Notification
from app.models.proposal import Proposal
from app.models.review import Review
from app.models.similarity_report import SimilarityReport
from app.models.user import User
from app.schemas.faculty import (
    FacultyAnalyticsRead,
    FacultyProfileRead,
    FacultyProposalDetailRead,
    FacultyProposalListItem,
    ReviewCreate,
    ReviewHistoryRead,
    ReviewResultRead,
    SimilarityMatchRead,
)
from app.services.proposal_service import generate_and_save_similarity_reports

router = APIRouter(prefix="/faculty", tags=["Faculty"])

VISIBLE_STATUSES = {
    "submitted",
    "approved",
    "changes_requested",
    "rejected",
}


def _proposal_list_item(
    proposal: Proposal,
    student_name: str,
    department_code: str | None,
    similarity_score: float | None,
) -> FacultyProposalListItem:
    return FacultyProposalListItem(
        id=proposal.id,
        title=proposal.title,
        status=proposal.status,
        student_name=student_name,
        department_code=department_code,
        submitted_at=proposal.submitted_at,
        similarity_score=similarity_score,
        abstract=proposal.abstract,
        problem_statement=proposal.problem_statement,
        objectives=proposal.objectives,
        methodology=proposal.methodology,
        technology_stack=proposal.technology_stack,
    )


def _review_history(review: Review) -> ReviewHistoryRead:
    return ReviewHistoryRead(
        id=review.id,
        decision=review.decision,
        comments=review.comments,
        reviewer_id=review.reviewer_id,
        created_at=review.created_at,
    )


@router.get("/me", response_model=FacultyProfileRead)
def get_my_profile(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> FacultyProfileRead:
    faculty = db.scalar(
        select(User)
        .options(joinedload(User.department))
        .where(User.id == current_user.id)
    )

    if faculty is None:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    return FacultyProfileRead(
        id=faculty.id,
        full_name=faculty.full_name,
        email=faculty.email,
        faculty_id=faculty.faculty_id,
        department_id=faculty.department_id,
        department_name=faculty.department.name if faculty.department else None,
        department_code=faculty.department.code if faculty.department else None,
        research_interests=faculty.research_interests,
    )


@router.get("/proposals", response_model=list[FacultyProposalListItem])
def list_assigned_proposals(
    review_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> list[FacultyProposalListItem]:
    if review_status is not None and review_status not in VISIBLE_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid proposal status")

    similarity_subquery = (
        select(
            SimilarityReport.proposal_id.label("proposal_id"),
            func.max(SimilarityReport.similarity_score).label("similarity_score"),
        )
        .group_by(SimilarityReport.proposal_id)
        .subquery()
    )

    statement = (
        select(
            Proposal,
            User.full_name.label("student_name"),
            Department.code.label("department_code"),
            similarity_subquery.c.similarity_score,
        )
        .join(User, Proposal.student_id == User.id)
        .outerjoin(Department, Proposal.department_id == Department.id)
        .outerjoin(
            similarity_subquery,
            similarity_subquery.c.proposal_id == Proposal.id,
        )
        .where(Proposal.supervisor_id == current_user.id)
        .order_by(Proposal.submitted_at.desc(), Proposal.created_at.desc())
    )

    if review_status is not None:
        statement = statement.where(Proposal.status == review_status)
    else:
        statement = statement.where(Proposal.status.in_(VISIBLE_STATUSES))

    rows = db.execute(statement).all()

    # Automatically compute missing similarity for proposals that have none
    results = []
    for row in rows:
        prop = row[0]
        score = row.similarity_score
        if score is None and prop.title:
            try:
                reports = generate_and_save_similarity_reports(prop, db)
                if reports:
                    score = max((r.similarity_score for r in reports), default=None)
            except Exception:
                pass

        results.append(
            _proposal_list_item(
                proposal=prop,
                student_name=row.student_name,
                department_code=row.department_code,
                similarity_score=score,
            )
        )

    return results


@router.get("/queue", response_model=list[FacultyProposalListItem])
def review_queue(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> list[FacultyProposalListItem]:
    return list_assigned_proposals(
        review_status="submitted",
        db=db,
        current_user=current_user,
    )


@router.get("/proposals/{proposal_id}", response_model=FacultyProposalDetailRead)
def get_assigned_proposal(
    proposal_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> FacultyProposalDetailRead:
    proposal = db.scalar(
        select(Proposal)
        .options(
            joinedload(Proposal.student),
            joinedload(Proposal.department),
            selectinload(Proposal.reviews),
            selectinload(Proposal.similarity_reports).joinedload(
                SimilarityReport.archived_project
            ),
        )
        .where(
            Proposal.id == proposal_id,
            Proposal.supervisor_id == current_user.id,
            Proposal.status.in_(VISIBLE_STATUSES),
        )
    )

    if proposal is None:
        raise HTTPException(status_code=404, detail="Assigned proposal not found")

    # If no similarity reports exist yet, compute and save them now
    if not proposal.similarity_reports:
        try:
            generate_and_save_similarity_reports(proposal, db)
            proposal = db.scalar(
                select(Proposal)
                .options(
                    joinedload(Proposal.student),
                    joinedload(Proposal.department),
                    selectinload(Proposal.reviews),
                    selectinload(Proposal.similarity_reports).joinedload(
                        SimilarityReport.archived_project
                    ),
                )
                .where(
                    Proposal.id == proposal_id,
                    Proposal.supervisor_id == current_user.id,
                )
            )
        except Exception:
            pass

    matches = []
    if proposal and proposal.similarity_reports:
        for report in sorted(
            proposal.similarity_reports,
            key=lambda item: item.similarity_score,
            reverse=True,
        ):
            proj_title = "Archived Project"
            if report.archived_project is not None:
                proj_title = report.archived_project.title
            elif isinstance(report.matched_sections, dict) and report.matched_sections.get("title"):
                proj_title = report.matched_sections.get("title")

            matches.append(
                SimilarityMatchRead(
                    archived_project_id=report.archived_project_id,
                    project=proj_title,
                    similarity_score=report.similarity_score,
                    matched_sections=report.matched_sections,
                    explanation=report.explanation,
                )
            )

    highest_similarity = max(
        (report.similarity_score for report in (proposal.similarity_reports if proposal else [])),
        default=None,
    )

    return FacultyProposalDetailRead(
        **_proposal_list_item(
            proposal=proposal,
            student_name=proposal.student.full_name if proposal.student else "Student",
            department_code=proposal.department.code if proposal.department else None,
            similarity_score=highest_similarity,
        ).model_dump(),
        document_path=proposal.document_path,
        student_id=proposal.student_id,
        supervisor_id=proposal.supervisor_id,
        similarity_matches=matches,
        reviews=[
            _review_history(review)
            for review in sorted(proposal.reviews, key=lambda item: item.created_at)
        ],
    )



@router.post(
    "/proposals/{proposal_id}/reviews",
    response_model=ReviewResultRead,
    status_code=status.HTTP_201_CREATED,
)
def review_proposal(
    proposal_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> ReviewResultRead:
    proposal = db.scalar(
        select(Proposal)
        .where(
            Proposal.id == proposal_id,
            Proposal.supervisor_id == current_user.id,
        )
        .with_for_update()
    )

    if proposal is None:
        raise HTTPException(status_code=404, detail="Assigned proposal not found")

    if proposal.status not in {"submitted", "changes_requested"}:
        raise HTTPException(
            status_code=409,
            detail="Only submitted or resubmitted proposals can be reviewed",
        )

    review = Review(
        proposal_id=proposal.id,
        reviewer_id=current_user.id,
        decision=payload.decision,
        comments=payload.comments.strip(),
    )
    proposal.status = payload.decision

    notification_messages = {
        "approved": f'Your proposal "{proposal.title}" was approved.',
        "changes_requested": (
            f'Your proposal "{proposal.title}" needs changes. '
            "Read your faculty review comment."
        ),
        "rejected": f'Your proposal "{proposal.title}" was rejected.',
    }

    notification = Notification(
        recipient_id=proposal.student_id,
        proposal_id=proposal.id,
        kind="faculty_review",
        message=notification_messages[payload.decision],
    )

    db.add_all([review, notification])
    db.commit()
    db.refresh(review)
    db.refresh(notification)

    return ReviewResultRead(
        review=_review_history(review),
        proposal_id=proposal.id,
        status=proposal.status,
        notification_id=notification.id,
    )


@router.get("/analytics", response_model=FacultyAnalyticsRead)
def get_faculty_analytics(
    db: Session = Depends(get_database),
    current_user: User = Depends(require_role("faculty")),
) -> FacultyAnalyticsRead:
    proposals = db.scalars(
        select(Proposal)
        .options(
            joinedload(Proposal.department),
            selectinload(Proposal.similarity_reports),
        )
        .where(
            Proposal.supervisor_id == current_user.id,
            Proposal.status.in_(VISIBLE_STATUSES),
        )
    ).all()

    valid_scores = []
    for proposal in proposals:
        if not proposal.similarity_reports and proposal.title:
            try:
                reports = generate_and_save_similarity_reports(proposal, db)
                if reports:
                    max_score = max((r.similarity_score for r in reports), default=None)
                    if max_score is not None:
                        valid_scores.append(max_score)
                    continue
            except Exception:
                pass
        max_score = max((report.similarity_score for report in proposal.similarity_reports), default=None)
        if max_score is not None:
            valid_scores.append(max_score)

    department_counts: Counter[str] = Counter(
        proposal.department.code if proposal.department else "Unassigned"
        for proposal in proposals
    )

    month_counts: defaultdict[str, int] = defaultdict(int)
    for proposal in proposals:
        submitted_at: datetime | None = proposal.submitted_at
        if submitted_at is not None:
            month_counts[submitted_at.strftime("%Y-%m")] += 1

    return FacultyAnalyticsRead(
        assigned_count=len(proposals),
        pending_count=statuses["submitted"],
        approved_count=statuses["approved"],
        changes_requested_count=statuses["changes_requested"],
        rejected_count=statuses["rejected"],
        average_similarity_score=(
            round(sum(valid_scores) / len(valid_scores), 4)
            if valid_scores
            else None
        ),
        by_status=[
            {"name": status_name, "value": count}
            for status_name, count in sorted(statuses.items())
        ],
        by_department=[
            {"department": department, "proposals": count}
            for department, count in sorted(department_counts.items())
        ],
        submission_trend=[
            {"month": month, "submissions": count}
            for month, count in sorted(month_counts.items())
        ],
    )