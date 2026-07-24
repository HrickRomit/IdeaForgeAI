import json
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_role
from app.core.security import get_password_hash
from app.models.archived_project import ArchivedProject
from app.models.department import Department
from app.models.proposal import Proposal
from app.models.similarity_report import SimilarityReport
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentRead,
    DepartmentUpdate,
)
from app.schemas.archived_project import (
    ArchivedProjectCreate,
    ArchivedProjectRead,
    ArchivedProjectUpdate,
)
from app.services.ai_service.chroma_client import get_archived_projects_collection
from app.services.ai_service.embeddings import get_embedding
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_role("admin"))],
)


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


def _get_department_or_404(db: Session, department_id: int) -> Department:
    department = db.get(Department, department_id)

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )

    return department


def _validate_department_id(db: Session, department_id: int | None) -> None:
    if department_id is not None:
        _get_department_or_404(db, department_id)


def _ensure_unique_user_fields(
    db: Session,
    email: str | None = None,
    student_id: str | None = None,
    faculty_id: str | None = None,
    exclude_user_id: int | None = None,
) -> None:
    if email:
        statement = select(User).where(User.email == email)
        if exclude_user_id is not None:
            statement = statement.where(User.id != exclude_user_id)

        if db.scalar(statement):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

    if student_id:
        statement = select(User).where(User.student_id == student_id)
        if exclude_user_id is not None:
            statement = statement.where(User.id != exclude_user_id)

        if db.scalar(statement):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this student ID already exists.",
            )

    if faculty_id:
        statement = select(User).where(User.faculty_id == faculty_id)
        if exclude_user_id is not None:
            statement = statement.where(User.id != exclude_user_id)

        if db.scalar(statement):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this faculty ID already exists.",
            )


def _ensure_unique_department_fields(
    db: Session,
    name: str | None = None,
    code: str | None = None,
    exclude_department_id: int | None = None,
) -> None:
    if name:
        statement = select(Department).where(Department.name == name)
        if exclude_department_id is not None:
            statement = statement.where(Department.id != exclude_department_id)

        if db.scalar(statement):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A department with this name already exists.",
            )

    if code:
        statement = select(Department).where(Department.code == code)
        if exclude_department_id is not None:
            statement = statement.where(Department.id != exclude_department_id)

        if db.scalar(statement):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A department with this code already exists.",
            )


# -----------------------------
# User Management: /admin/users
# -----------------------------

@router.get("/users", response_model=list[UserRead])
def list_users(
    role: str | None = Query(default=None),
    department_id: int | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_database),
) -> list[User]:
    statement = select(User).order_by(User.created_at.desc())

    if role is not None:
        statement = statement.where(User.role == role)

    if department_id is not None:
        statement = statement.where(User.department_id == department_id)

    if is_active is not None:
        statement = statement.where(User.is_active == is_active)

    return list(db.scalars(statement).all())


@router.post(
    "/users",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_database),
) -> User:
    _validate_department_id(db, payload.department_id)

    _ensure_unique_user_fields(
        db=db,
        email=payload.email,
        student_id=payload.student_id,
        faculty_id=payload.faculty_id,
    )

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        student_id=payload.student_id,
        faculty_id=payload.faculty_id,
        department_id=payload.department_id,
        research_interests=payload.research_interests,
        is_active=True,
    )

    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create user because duplicate data was provided.",
        ) from error

    db.refresh(user)
    return user


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_database),
) -> User:
    return _get_user_or_404(db, user_id)


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_database),
) -> User:
    user = _get_user_or_404(db, user_id)
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one field to update.",
        )

    if "department_id" in updates:
        _validate_department_id(db, updates["department_id"])

    _ensure_unique_user_fields(
        db=db,
        email=updates.get("email"),
        student_id=updates.get("student_id"),
        faculty_id=updates.get("faculty_id"),
        exclude_user_id=user.id,
    )

    if "password" in updates:
        user.hashed_password = get_password_hash(updates.pop("password"))

    for field, value in updates.items():
        setattr(user, field, value)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update user because duplicate data was provided.",
        ) from error

    db.refresh(user)
    return user


@router.delete("/users/{user_id}", response_model=UserRead)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_database),
    current_admin: User = Depends(require_role("admin")),
) -> User:
    """
    Safely 'deletes' a user by deactivating the account.
    Historical proposals, reviews, and chat records remain intact.
    """
    user = _get_user_or_404(db, user_id)

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin account.",
        )

    user.is_active = False
    db.commit()
    db.refresh(user)

    return user


# ----------------------------------------
# Department Management: /admin/departments
# ----------------------------------------

@router.get("/departments", response_model=list[DepartmentRead])
def list_departments(
    db: Session = Depends(get_database),
) -> list[Department]:
    return list(
        db.scalars(
            select(Department).order_by(Department.name.asc())
        ).all()
    )


@router.post(
    "/departments",
    response_model=DepartmentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_database),
) -> Department:
    _ensure_unique_department_fields(
        db=db,
        name=payload.name,
        code=payload.code,
    )

    department = Department(
        name=payload.name,
        code=payload.code,
        description=payload.description,
    )

    db.add(department)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create department because the name or code already exists.",
        ) from error

    db.refresh(department)
    return department


@router.get("/departments/{department_id}", response_model=DepartmentRead)
def get_department(
    department_id: int,
    db: Session = Depends(get_database),
) -> Department:
    return _get_department_or_404(db, department_id)


@router.patch("/departments/{department_id}", response_model=DepartmentRead)
def update_department(
    department_id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_database),
) -> Department:
    department = _get_department_or_404(db, department_id)
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one field to update.",
        )

    _ensure_unique_department_fields(
        db=db,
        name=updates.get("name"),
        code=updates.get("code"),
        exclude_department_id=department.id,
    )

    for field, value in updates.items():
        setattr(department, field, value)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update department because the name or code already exists.",
        ) from error

    db.refresh(department)
    return department


@router.delete(
    "/departments/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_department(
    department_id: int,
    db: Session = Depends(get_database),
) -> None:
    department = _get_department_or_404(db, department_id)

    has_users = db.scalar(
        select(User.id).where(User.department_id == department.id).limit(1)
    )
    has_proposals = db.scalar(
        select(Proposal.id).where(Proposal.department_id == department.id).limit(1)
    )
    has_archived_projects = db.scalar(
        select(ArchivedProject.id)
        .where(ArchivedProject.department_id == department.id)
        .limit(1)
    )

    if has_users or has_proposals or has_archived_projects:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This department cannot be deleted because users, proposals, "
                "or archived projects are still linked to it."
            ),
        )

    db.delete(department)
    db.commit()
    # ---------------------------------------
# Archive Management: /admin/archive
# ---------------------------------------

def _json_value(value: str | None, default):
    """Safely read JSON stored in PostgreSQL text fields."""
    if value is None:
        return default

    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return default


def _to_json_text(value) -> str | None:
    """Converts list/dict values to JSON text for PostgreSQL."""
    if value is None:
        return None

    if isinstance(value, str):
        return value

    return json.dumps(value, ensure_ascii=False)


def _archive_to_read(archive: ArchivedProject) -> ArchivedProjectRead:
    """Converts database text/JSON fields into clean API response fields."""
    raw_technology_stack = archive.technology_stack

    try:
        technology_stack = (
            json.loads(raw_technology_stack)
            if raw_technology_stack is not None
            else None
        )
    except (TypeError, json.JSONDecodeError):
        technology_stack = raw_technology_stack

    return ArchivedProjectRead(
        id=archive.id,
        title=archive.title,
        abstract=archive.abstract,
        authors=_json_value(archive.authors, None),
        supervisor_name=archive.supervisor_name,
        academic_year=archive.academic_year,
        keywords=_json_value(archive.keywords, None),
        technology_stack=technology_stack,
        document_path=archive.document_path,
        chroma_document_id=archive.chroma_document_id or "",
        department_id=archive.department_id,
    )


def _archive_search_document(archive: ArchivedProject) -> str:
    """Builds the text that semantic/vector search uses."""
    department_name = (
        archive.department.name
        if archive.department is not None
        else "Not specified"
    )

    authors = _json_value(archive.authors, [])
    keywords = _json_value(archive.keywords, [])
    technology_stack = _json_value(archive.technology_stack, archive.technology_stack)

    return "\n\n".join(
        [
            f"Title: {archive.title}",
            f"Abstract: {archive.abstract}",
            f"Department: {department_name}",
            f"Academic Year: {archive.academic_year or 'Not specified'}",
            f"Supervisor: {archive.supervisor_name or 'Not specified'}",
            f"Authors: {json.dumps(authors, ensure_ascii=False)}",
            f"Keywords: {json.dumps(keywords, ensure_ascii=False)}",
            f"Technology Stack: {json.dumps(technology_stack, ensure_ascii=False)}",
        ]
    )


def _sync_archive_to_chroma(archive: ArchivedProject) -> None:
    """
    Inserts or updates the archive record in ChromaDB.
    This makes the project immediately available to /projects/search.
    """
    if not archive.chroma_document_id:
        raise ValueError("Archive project is missing its Chroma document ID.")

    department_name = (
        archive.department.name
        if archive.department is not None
        else ""
    )

    collection = get_archived_projects_collection()
    document = _archive_search_document(archive)

    collection.upsert(
        ids=[archive.chroma_document_id],
        embeddings=[get_embedding(document)],
        documents=[document],
        metadatas=[
            {
                "title": archive.title,
                "department": department_name,
                "academic_year": archive.academic_year or "",
                "keywords": archive.keywords or "[]",
            }
        ],
    )


def _remove_archive_from_chroma(chroma_document_id: str) -> None:
    """Removes the archive project's vector entry from ChromaDB."""
    collection = get_archived_projects_collection()
    collection.delete(ids=[chroma_document_id])


@router.get("/archive", response_model=list[ArchivedProjectRead])
def list_archived_projects(
    department_id: int | None = Query(default=None),
    academic_year: str | None = Query(default=None, max_length=20),
    db: Session = Depends(get_database),
) -> list[ArchivedProjectRead]:
    statement = select(ArchivedProject).order_by(ArchivedProject.created_at.desc())

    if department_id is not None:
        statement = statement.where(
            ArchivedProject.department_id == department_id
        )

    if academic_year is not None:
        statement = statement.where(
            ArchivedProject.academic_year == academic_year.strip()
        )

    archives = db.scalars(statement).all()
    return [_archive_to_read(archive) for archive in archives]


@router.post(
    "/archive",
    response_model=ArchivedProjectRead,
    status_code=status.HTTP_201_CREATED,
)
def create_archived_project(
    payload: ArchivedProjectCreate,
    db: Session = Depends(get_database),
) -> ArchivedProjectRead:
    _validate_department_id(db, payload.department_id)

    archive = ArchivedProject(
        title=payload.title,
        abstract=payload.abstract,
        authors=_to_json_text(payload.authors),
        supervisor_name=payload.supervisor_name,
        academic_year=payload.academic_year,
        keywords=_to_json_text(payload.keywords),
        technology_stack=_to_json_text(payload.technology_stack),
        document_path=payload.document_path,
        department_id=payload.department_id,
        chroma_document_id=f"archive_{uuid4().hex}",
    )

    db.add(archive)
    db.flush()
    db.refresh(archive)

    try:
        _sync_archive_to_chroma(archive)
        db.commit()
    except Exception as error:
        db.rollback()

        try:
            _remove_archive_from_chroma(archive.chroma_document_id)
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Archive project could not be saved because the vector "
                "search service is unavailable."
            ),
        ) from error

    db.refresh(archive)
    return _archive_to_read(archive)


@router.get("/archive/{archive_id}", response_model=ArchivedProjectRead)
def get_archived_project(
    archive_id: int,
    db: Session = Depends(get_database),
) -> ArchivedProjectRead:
    archive = db.get(ArchivedProject, archive_id)

    if archive is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archived project not found.",
        )

    return _archive_to_read(archive)


@router.patch("/archive/{archive_id}", response_model=ArchivedProjectRead)
def update_archived_project(
    archive_id: int,
    payload: ArchivedProjectUpdate,
    db: Session = Depends(get_database),
) -> ArchivedProjectRead:
    archive = db.get(ArchivedProject, archive_id)

    if archive is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archived project not found.",
        )

    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one field to update.",
        )

    if "department_id" in updates:
        _validate_department_id(db, updates["department_id"])

    for json_field in ("authors", "keywords", "technology_stack"):
        if json_field in updates:
            updates[json_field] = _to_json_text(updates[json_field])

    for field, value in updates.items():
        setattr(archive, field, value)

    db.flush()
    db.refresh(archive)

    try:
        _sync_archive_to_chroma(archive)
        db.commit()
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Archive project could not be updated because the vector "
                "search service is unavailable."
            ),
        ) from error

    db.refresh(archive)
    return _archive_to_read(archive)


@router.delete(
    "/archive/{archive_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_archived_project(
    archive_id: int,
    db: Session = Depends(get_database),
) -> None:
    archive = db.get(ArchivedProject, archive_id)

    if archive is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archived project not found.",
        )

    has_similarity_reports = db.scalar(
        select(SimilarityReport.id)
        .where(SimilarityReport.archived_project_id == archive.id)
        .limit(1)
    )

    if has_similarity_reports:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This archived project cannot be deleted because it is linked "
                "to existing similarity reports."
            ),
        )

    try:
        if archive.chroma_document_id:
            _remove_archive_from_chroma(archive.chroma_document_id)

        db.delete(archive)
        db.commit()
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Archive project could not be deleted because the vector "
                "search service is unavailable."
            ),
        ) from error