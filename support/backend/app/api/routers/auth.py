from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshTokenRequest, TokenResponse
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_user, create_user

router = APIRouter(prefix="/auth", tags=["Auth"])


def _create_token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(subject=str(user.id)),
        refresh_token=create_refresh_token(subject=str(user.id)),
        user=user,
    )


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_database),
) -> User:
    """
    Public registration is restricted to students.

    Faculty and admin accounts must be created by an authenticated admin
    through POST /admin/users.
    """
    if payload.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Public registration is only available for student accounts. "
                "Faculty and admin accounts must be created by an administrator."
            ),
        )

    return create_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_database),
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _create_token_response(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_database),
) -> TokenResponse:
    token_payload = decode_refresh_token(payload.refresh_token)

    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    subject = token_payload.get("sub")

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return _create_token_response(user)


@router.get("/me", response_model=UserRead)
def get_logged_in_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user