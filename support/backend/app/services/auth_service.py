from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, payload: UserCreate) -> User:
    email = payload.email.lower().strip()
    role = payload.role.lower().strip()

    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    if role == "student" and not payload.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="student_id is required for student registration",
        )

    if role == "faculty" and not payload.faculty_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="faculty_id is required for faculty registration",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=get_password_hash(payload.password),
        role=role,
        student_id=payload.student_id,
        faculty_id=payload.faculty_id,
        department_id=payload.department_id,
        research_interests=payload.research_interests,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    if not user.is_active:
        return None

    return user