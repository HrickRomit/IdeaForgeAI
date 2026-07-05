from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Review(TimestampMixin, Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    decision: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    comments: Mapped[str | None] = mapped_column(Text)

    proposal_id: Mapped[int] = mapped_column(ForeignKey("proposals.id"), nullable=False)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    proposal = relationship("Proposal", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")
