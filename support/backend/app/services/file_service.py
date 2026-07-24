from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

settings = get_settings()

BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]
CHUNK_SIZE = 1024 * 1024  # 1 MB


def get_upload_root() -> Path:
    """Returns and creates the configured backend upload directory."""
    upload_root = (BACKEND_DIRECTORY / settings.upload_directory).resolve()
    upload_root.mkdir(parents=True, exist_ok=True)
    return upload_root


async def save_proposal_pdf(proposal_id: int, file: UploadFile) -> str:
    """
    Validates and saves one PDF document.

    Returns a relative path such as:
    uploads/proposals/proposal_12_a1b2c3.pdf
    """
    if file.content_type and file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are allowed.",
        )

    first_chunk = await file.read(CHUNK_SIZE)

    if not first_chunk.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded file is not a valid PDF.",
        )

    maximum_size = settings.max_upload_size_mb * 1024 * 1024
    uploaded_size = len(first_chunk)

    if uploaded_size > maximum_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"PDF file size must not exceed {settings.max_upload_size_mb} MB.",
        )

    relative_directory = Path(settings.upload_directory) / "proposals"
    destination_directory = (BACKEND_DIRECTORY / relative_directory).resolve()
    destination_directory.mkdir(parents=True, exist_ok=True)

    filename = f"proposal_{proposal_id}_{uuid4().hex}.pdf"
    destination = destination_directory / filename

    try:
        with destination.open("wb") as output_file:
            output_file.write(first_chunk)

            while chunk := await file.read(CHUNK_SIZE):
                uploaded_size += len(chunk)

                if uploaded_size > maximum_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=(
                            f"PDF file size must not exceed "
                            f"{settings.max_upload_size_mb} MB."
                        ),
                    )

                output_file.write(chunk)

    except Exception:
        destination.unlink(missing_ok=True)
        raise

    finally:
        await file.close()

    return (relative_directory / filename).as_posix()


def delete_stored_file(relative_path: str | None) -> None:
    """Safely removes an old uploaded file inside the configured upload folder."""
    if not relative_path:
        return

    upload_root = get_upload_root()
    target = (BACKEND_DIRECTORY / relative_path).resolve()

    if not target.is_relative_to(upload_root):
        return

    if target.is_file():
        target.unlink()