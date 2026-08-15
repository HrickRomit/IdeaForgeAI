from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.api.routers import admin, auth, chat, faculty, projects, proposals
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.services.admin_service import ensure_fixed_admin_account

settings = get_settings()

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).rstrip("/") for origin in settings.backend_cors_origins] if isinstance(settings.backend_cors_origins, list) else ["*"],
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_fixed_admin_account() -> None:
    db = SessionLocal()
    try:
        ensure_fixed_admin_account(db)
    finally:
        db.close()


app.include_router(auth.router)
app.include_router(proposals.router)
app.include_router(faculty.router)
app.include_router(projects.router)
app.include_router(chat.router)
app.include_router(admin.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check(db: Session = Depends(get_database)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}