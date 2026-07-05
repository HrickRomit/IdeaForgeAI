from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Proposal(TimestampMixin, Base):
    __tablename__ = "proposals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    abstract: Mapped[str] = mapped_column(Text, nullable=False)
    problem_statement: Mapped[str | None] = mapped_column(Text)
    objectives: Mapped[str | None] = mapped_column(Text)
    methodology: Mapped[str | None] = mapped_column(Text)
    technology_stack: Mapped[str | None] = mapped_column(Text)
    document_path: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(40), default="draft", index=True, nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    supervisor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"))

    student = relationship("User", back_populates="submitted_proposals", foreign_keys=[student_id])
    supervisor = relationship("User", back_populates="supervised_proposals", foreign_keys=[supervisor_id])
    department = relationship("Department", back_populates="proposals")
    reviews = relationship("Review", back_populates="proposal", cascade="all, delete-orphan")
    similarity_reports = relationship("SimilarityReport", back_populates="proposal", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="proposal", cascade="all, delete-orphan")
