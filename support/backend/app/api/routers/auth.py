from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_user, create_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_database),
) -> User:
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

    access_token = create_access_token(subject=str(user.id))

    return TokenResponse(
        access_token=access_token,
        user=user,
    )


@router.get("/me", response_model=UserRead)
def get_logged_in_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user