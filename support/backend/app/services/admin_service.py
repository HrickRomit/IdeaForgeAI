from secrets import compare_digest

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User

FIXED_ADMIN_USERNAME = "admin"
FIXED_ADMIN_PASSWORD = "admin"
FIXED_ADMIN_EMAIL = "admin@ideaforge.local"


def ensure_fixed_admin_account(db: Session) -> User:
    """
    Creates the one allowed admin account when it does not exist.
    Any legacy admin accounts are disabled and changed to faculty so that
    only this fixed account retains the admin role.
    """
    admin = db.scalar(
        select(User).where(User.email == FIXED_ADMIN_EMAIL)
    )

    if admin is None:
        admin = User(
            full_name="System Administrator",
            email=FIXED_ADMIN_EMAIL,
            hashed_password=get_password_hash(FIXED_ADMIN_PASSWORD),
            role="admin",
            is_active=True,
        )
        db.add(admin)
    else:
        admin.full_name = "System Administrator"
        admin.role = "admin"
        admin.is_active = True

        if not verify_password(FIXED_ADMIN_PASSWORD, admin.hashed_password):
            admin.hashed_password = get_password_hash(FIXED_ADMIN_PASSWORD)

    # Removes any previously-created non-fixed admin privileges.
    db.execute(
        update(User)
        .where(
            User.role == "admin",
            User.email != FIXED_ADMIN_EMAIL,
        )
        .values(role="faculty", is_active=False)
    )

    db.commit()
    db.refresh(admin)
    return admin


def authenticate_fixed_admin(
    db: Session,
    username: str,
    password: str,
) -> User | None:
    if not compare_digest(username.strip(), FIXED_ADMIN_USERNAME):
        return None

    if not compare_digest(password, FIXED_ADMIN_PASSWORD):
        return None

    return ensure_fixed_admin_account(db)


def is_fixed_admin(user: User) -> bool:
    return (
        user.role == "admin"
        and user.email == FIXED_ADMIN_EMAIL
        and user.is_active
    )