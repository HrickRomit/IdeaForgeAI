import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

BACKEND_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIRECTORY))

from app.api.deps import get_database
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base
from app.main import app
from app.models import *  # noqa: F403
from app.models.user import User


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    def override_get_database():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_database] = override_get_database

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def create_user():
    def _create_user(
        role: str = "student",
        email: str = "student@example.com",
        password: str = "Password123",
        full_name: str = "Test User",
        department_id: int | None = None,
    ) -> User:
        db = TestingSessionLocal()

        user = User(
            full_name=full_name,
            email=email,
            hashed_password=get_password_hash(password),
            role=role,
            department_id=department_id,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        db.expunge(user)
        db.close()

        return user

    return _create_user


@pytest.fixture
def auth_headers():
    def _auth_headers(user: User) -> dict[str, str]:
        token = create_access_token(str(user.id))
        return {"Authorization": f"Bearer {token}"}

    return _auth_headers