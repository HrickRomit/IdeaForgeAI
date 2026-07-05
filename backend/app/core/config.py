from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from backend/.env or the project root .env."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "IdeaForge AI API"
    app_version: str = "0.1.0"
    environment: str = "local"

    database_url: str = "postgresql+psycopg://ideaforge:change_me@localhost:5433/ideaforge"

    jwt_secret_key: str = "replace_with_a_long_random_secret"
    jwt_algorithm: str = "HS256"

    gemini_api_key: str | None = None
    chroma_host: str = "localhost"
    chroma_port: int = 8001

    backend_cors_origins: list[AnyHttpUrl | str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
