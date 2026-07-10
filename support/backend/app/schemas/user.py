from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


UserRole = Literal["student", "faculty", "admin"]


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)
    role: UserRole
    student_id: str | None = Field(default=None, max_length=50)
    faculty_id: str | None = Field(default=None, max_length=50)
    department_id: int | None = None
    research_interests: str | None = None


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
