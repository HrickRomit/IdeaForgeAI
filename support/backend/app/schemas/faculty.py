from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FacultyDecision = Literal["approved", "changes_requested", "rejected"]


class FacultyProfileRead(BaseModel):
    id: int
    full_name: str
    email: str
    faculty_id: str | None
    department_id: int | None
    department_name: str | None
    department_code: str | None
    research_interests: str | None


class FacultyProposalListItem(BaseModel):
    id: int
    title: str
    status: str
    student_name: str
    department_code: str | None
    submitted_at: datetime | None
    similarity_score: float | None


class SimilarityMatchRead(BaseModel):
    archived_project_id: int | None
    project: str
    similarity_score: float
    matched_sections: dict | None = None
    explanation: str | None = None


class ReviewHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    decision: str
    comments: str | None
    reviewer_id: int
    created_at: datetime


class FacultyProposalDetailRead(FacultyProposalListItem):
    abstract: str
    problem_statement: str | None
    objectives: str | None
    methodology: str | None
    technology_stack: str | None
    document_path: str | None
    student_id: int
    supervisor_id: int | None
    similarity_matches: list[SimilarityMatchRead]
    reviews: list[ReviewHistoryRead]


class ReviewCreate(BaseModel):
    decision: FacultyDecision
    comments: str = Field(min_length=1, max_length=5000)


class ReviewResultRead(BaseModel):
    review: ReviewHistoryRead
    proposal_id: int
    status: str
    notification_id: int


class FacultyAnalyticsRead(BaseModel):
    assigned_count: int
    pending_count: int
    approved_count: int
    changes_requested_count: int
    rejected_count: int
    average_similarity_score: float | None
    by_status: list[dict[str, int | str]]
    by_department: list[dict[str, int | str]]
    submission_trend: list[dict[str, int | str]]