from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.department import Department
from app.models.user import User
from app.schemas.user import UserCreate

DEFAULT_DEPARTMENT_NAMES = {
    "CSE": "Computer Science and Engineering",
    "EEE": "Electrical and Electronic Engineering",
    "CEE": "Civil and Environmental Engineering",
}


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_login_identifier(db: Session, identifier: str) -> User | None:
    identifier = identifier.strip()
    normalized_email = identifier.lower()

    return (
        db.query(User)
        .filter(
            or_(
                User.email == normalized_email,
                User.student_id == identifier,
                User.faculty_id == identifier,
            )
        )
        .first()
    )


def resolve_department_id(db: Session, payload: UserCreate) -> int | None:
    department_code = payload.department_code

    if not department_code:
        return payload.department_id

    department = db.query(Department).filter(Department.code == department_code).first()

    if department is None:
        department = Department(
            code=department_code,
            name=DEFAULT_DEPARTMENT_NAMES.get(department_code, department_code),
            description=f"{department_code} department",
        )
        db.add(department)
        db.flush()

    return department.id


def create_user(db: Session, payload: UserCreate) -> User:
    email = payload.email.lower().strip()
    role = payload.role.lower().strip()

    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=get_password_hash(payload.password),
        role=role,
        student_id=payload.student_id,
        faculty_id=payload.faculty_id,
        department_id=resolve_department_id(db, payload),
        research_interests=payload.research_interests,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_login_identifier(db, email)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    if not user.is_active:
        return None

    return user
