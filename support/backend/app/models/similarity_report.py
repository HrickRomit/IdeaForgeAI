from sqlalchemy import Float, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class SimilarityReport(TimestampMixin, Base):
    __tablename__ = "similarity_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    novelty_score: Mapped[float | None] = mapped_column(Float)
    matched_sections: Mapped[dict | None] = mapped_column(JSON)
    explanation: Mapped[str | None] = mapped_column(Text)

    proposal_id: Mapped[int] = mapped_column(ForeignKey("proposals.id"), nullable=False)
    archived_project_id: Mapped[int | None] = mapped_column(ForeignKey("archived_projects.id"))

    proposal = relationship("Proposal", back_populates="similarity_reports")
    archived_project = relationship("ArchivedProject", back_populates="similarity_matches")
