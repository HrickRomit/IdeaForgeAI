import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.chat import ChatMessage, ChatSession
from app.models.proposal import Proposal
from app.models.similarity_report import SimilarityReport
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSource,
)
from app.services.ai_service.chatbot import ask_chatbot
from app.services.ai_service.search_engine import search_projects

router = APIRouter(prefix="/chat", tags=["Chat"])


def _make_session_title(message: str) -> str:
    """Creates a short title for a new chat session."""
    cleaned_message = " ".join(message.split())
    return cleaned_message[:100]


def _build_sources(search_results: list[dict]) -> list[ChatSource]:
    """Converts vector-search results into safe API source data."""
    sources: list[ChatSource] = []

    for result in search_results:
        metadata = result.get("metadata") or {}

        sources.append(
            ChatSource(
                project_id=str(result.get("project_id", "")),
                title=str(metadata.get("title") or "Archived project"),
                distance_score=float(result.get("distance_score", 0)),
                metadata=metadata,
            )
        )

    return sources


@router.post(
    "/message",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_chat_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> ChatMessageResponse:
    """
    Saves the user's message, retrieves relevant archived projects,
    asks the RAG assistant (incorporating optional proposal review context),
    then saves its answer and sources.

    Send no session_id to create a new conversation.
    Send an existing session_id to continue that conversation.
    """
    question = payload.message.strip()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty.",
        )

    if payload.session_id is None:
        session = ChatSession(
            user_id=current_user.id,
            title=_make_session_title(question),
        )
        db.add(session)
        db.flush()
    else:
        session = db.scalar(
            select(ChatSession).where(
                ChatSession.id == payload.session_id,
                ChatSession.user_id == current_user.id,
            )
        )

        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found.",
            )

    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=question,
    )
    db.add(user_message)

    proposal_info = None
    if payload.proposal_id is not None:
        proposal = db.scalar(select(Proposal).where(Proposal.id == payload.proposal_id))
        if proposal is not None:
            sim_report = db.scalar(
                select(SimilarityReport)
                .where(SimilarityReport.proposal_id == proposal.id)
                .order_by(SimilarityReport.id.desc())
            )
            sim_score = (
                round(sim_report.similarity_score * 100, 1)
                if sim_report and sim_report.similarity_score is not None
                else None
            )
            student_name = "Student"
            if proposal.student is not None:
                student_name = getattr(proposal.student, "full_name", getattr(proposal.student, "name", "Student"))

            proposal_info = {
                "id": proposal.id,
                "title": proposal.title,
                "student_name": student_name,
                "department": proposal.department.code if proposal.department else "Unassigned",
                "status": proposal.status,
                "similarity_score": sim_score,
                "abstract": proposal.abstract,
                "problem_statement": proposal.problem_statement or "N/A",
                "objectives": proposal.objectives or "N/A",
                "methodology": proposal.methodology or "N/A",
                "technology_stack": proposal.technology_stack or "N/A",
                "similarity_notes": sim_report.explanation if sim_report else "N/A",
            }

    if proposal_info is None and payload.proposal_context is not None:
        proposal_info = payload.proposal_context

    try:
        # This search is used to save the sources shown with the answer.
        search_results = search_projects(question, top_k=3)

        # ask_chatbot performs RAG search & proposal context integration
        answer = ask_chatbot(question, proposal_context=proposal_info)
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI assistant is temporarily unavailable. Please try again.",
        ) from error

    sources = _build_sources(search_results)

    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=answer,
        sources=json.dumps(
            [source.model_dump() for source in sources],
            ensure_ascii=False,
        ),
    )
    db.add(assistant_message)

    session.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user_message)
    db.refresh(assistant_message)

    return ChatMessageResponse(
        session_id=session.id,
        user_message_id=user_message.id,
        assistant_message_id=assistant_message.id,
        answer=assistant_message.content,
        sources=sources,
        created_at=assistant_message.created_at,
    )