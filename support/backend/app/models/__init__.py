from app.models.archived_project import ArchivedProject
from app.models.chat import ChatMessage, ChatSession
from app.models.department import Department
from app.models.notification import Notification
from app.models.proposal import Proposal
from app.models.recommendation import Recommendation
from app.models.review import Review
from app.models.similarity_report import SimilarityReport
from app.models.user import User

__all__ = [
    "ArchivedProject",
    "ChatMessage",
    "ChatSession",
    "Department",
    "Notification",
    "Proposal",
    "Recommendation",
    "Review",
    "SimilarityReport",
    "User",
]