from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def _create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
) -> str:
    expires_at = datetime.now(timezone.utc) + expires_delta

    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_access_token(subject: str) -> str:
    return _create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(
            minutes=settings.access_token_expire_minutes
        ),
    )


def create_refresh_token(subject: str) -> str:
    return _create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(
            days=settings.refresh_token_expire_days
        ),
    )


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        return None


def decode_access_token(token: str) -> dict[str, Any] | None:
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        return None

    return payload


def decode_refresh_token(token: str) -> dict[str, Any] | None:
    payload = decode_token(token)

    if not payload or payload.get("type") != "refresh":
        return None

    return payload