from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


UserRole = Literal["student", "faculty", "admin"]


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole
    student_id: str | None = Field(default=None, max_length=50)
    faculty_id: str | None = Field(default=None, max_length=50)
    department_id: int | None = None
    research_interests: str | None = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value:
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("student_id", "faculty_id", mode="before")
    @classmethod
    def clean_identifiers(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: UserRole | None = None
    student_id: str | None = Field(default=None, max_length=50)
    faculty_id: str | None = Field(default=None, max_length=50)
    department_id: int | None = None
    research_interests: str | None = None
    is_active: bool | None = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        if "@" not in value:
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("student_id", "faculty_id", mode="before")
    @classmethod
    def clean_identifiers(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: str
    student_id: str | None = None
    faculty_id: str | None = None
    department_id: int | None = None
    research_interests: str | None = None
    is_active: bool