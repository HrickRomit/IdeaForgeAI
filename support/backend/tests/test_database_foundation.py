from fastapi.testclient import TestClient

from app.db.base import Base
from app.main import app


def test_health_check() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_initial_model_metadata_contains_core_tables() -> None:
    expected_tables = {
        "archived_projects",
        "chat_messages",
        "chat_sessions",
        "departments",
        "proposals",
        "recommendations",
        "reviews",
        "similarity_reports",
        "users",
    }

    assert expected_tables.issubset(Base.metadata.tables.keys())
