from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class ArchivedProject(TimestampMixin, Base):
    __tablename__ = "archived_projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    abstract: Mapped[str] = mapped_column(Text, nullable=False)
    authors: Mapped[str | None] = mapped_column(Text)
    supervisor_name: Mapped[str | None] = mapped_column(String(120))
    academic_year: Mapped[str | None] = mapped_column(String(20), index=True)
    keywords: Mapped[str | None] = mapped_column(Text)
    technology_stack: Mapped[str | None] = mapped_column(Text)
    document_path: Mapped[str | None] = mapped_column(String(500))
    chroma_document_id: Mapped[str | None] = mapped_column(String(120), unique=True)

    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"))

    department = relationship("Department", back_populates="archived_projects")
    similarity_matches = relationship("SimilarityReport", back_populates="archived_project")
