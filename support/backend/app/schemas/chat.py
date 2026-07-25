from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
        description="The user's question for the archive assistant",
    )
    session_id: int | None = Field(
        default=None,
        description="Existing chat session ID. Omit this to start a new session.",
    )


class ChatSource(BaseModel):
    project_id: str
    title: str
    distance_score: float
    metadata: dict[str, Any]


class ChatMessageResponse(BaseModel):
    session_id: int
    user_message_id: int
    assistant_message_id: int
    answer: str
    sources: list[ChatSource]
    created_at: datetime


class ChatSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None
    user_id: int | None
    created_at: datetime
    updated_at: datetime