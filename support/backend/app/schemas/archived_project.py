from typing import Any

from pydantic import BaseModel, Field, field_validator


class ArchivedProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    abstract: str = Field(min_length=1, max_length=10000)
    authors: list[dict[str, Any] | str] | None = None
    supervisor_name: str | None = Field(default=None, max_length=120)
    academic_year: str | None = Field(default=None, max_length=20)
    keywords: list[str] | None = None
    technology_stack: dict[str, Any] | list[Any] | str | None = None
    document_path: str | None = Field(default=None, max_length=500)
    department_id: int | None = None

    @field_validator("title", "abstract")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value

    @field_validator("supervisor_name", "academic_year", "document_path", mode="before")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("keywords")
    @classmethod
    def clean_keywords(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        return [keyword.strip() for keyword in value if keyword.strip()]


class ArchivedProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    abstract: str | None = Field(default=None, min_length=1, max_length=10000)
    authors: list[dict[str, Any] | str] | None = None
    supervisor_name: str | None = Field(default=None, max_length=120)
    academic_year: str | None = Field(default=None, max_length=20)
    keywords: list[str] | None = None
    technology_stack: dict[str, Any] | list[Any] | str | None = None
    document_path: str | None = Field(default=None, max_length=500)
    department_id: int | None = None

    @field_validator("title", "abstract")
    @classmethod
    def validate_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value

    @field_validator("supervisor_name", "academic_year", "document_path", mode="before")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("keywords")
    @classmethod
    def clean_keywords(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        return [keyword.strip() for keyword in value if keyword.strip()]


class ArchivedProjectRead(BaseModel):
    id: int
    title: str
    abstract: str
    authors: list[dict[str, Any] | str] | None
    supervisor_name: str | None
    academic_year: str | None
    keywords: list[str] | None
    technology_stack: dict[str, Any] | list[Any] | str | None
    document_path: str | None
    chroma_document_id: str
    department_id: int | None