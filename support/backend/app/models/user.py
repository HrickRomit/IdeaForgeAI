from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), index=True, nullable=False)
    student_id: Mapped[str | None] = mapped_column(String(50), unique=True)
    faculty_id: Mapped[str | None] = mapped_column(String(50), unique=True)
    research_interests: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"))

    department = relationship("Department", back_populates="users")
    submitted_proposals = relationship(
        "Proposal",
        back_populates="student",
        foreign_keys="Proposal.student_id",
    )
    supervised_proposals = relationship(
        "Proposal",
        back_populates="supervisor",
        foreign_keys="Proposal.supervisor_id",
    )
    reviews = relationship("Review", back_populates="reviewer")
    chat_sessions = relationship("ChatSession", back_populates="user")
