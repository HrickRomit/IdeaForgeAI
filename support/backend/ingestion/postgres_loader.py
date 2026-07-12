"""
postgres_loader.py - load into PostgreSQL
"""
import json
from sqlalchemy.orm import Session
from app.models.archived_project import ArchivedProject

__all__ = ["load_to_postgres"]

def load_to_postgres(project_data: dict, db: Session) -> ArchivedProject:
    """
    Receive validated project object, insert into PostgreSQL avoiding duplicates,
    and return the inserted (or existing) record.
    """
    project_id = project_data.get("project_id")

    # 1. Avoid duplicate projects by checking our unique identifier
    existing_project = db.query(ArchivedProject).filter_by(chroma_document_id=project_id).first()
    if existing_project:
        print(f"Project {project_id} already exists in PostgreSQL. Skipping insertion.")
        return existing_project

    # 2. Extract and format fields
    title = project_data.get("basic_information", {}).get("title", "")
    abstract = project_data.get("abstract", "")

    acad_info = project_data.get("academic_information", {})
    academic_year = acad_info.get("academic_year")

    # Extract supervisor name safely
    supervisor = acad_info.get("supervisor", {})
    supervisor_name = supervisor.get("name") if supervisor else None

    # Serialize nested lists/dicts to JSON strings for the database Text columns
    authors_json = json.dumps(acad_info.get("authors", []))
    keywords_json = json.dumps(project_data.get("keywords", []))
    technologies_json = json.dumps(project_data.get("technologies", {}))

    # 3. Create the SQLAlchemy model instance
    new_project = ArchivedProject(
        title=title,
        abstract=abstract,
        authors=authors_json,
        supervisor_name=supervisor_name,
        academic_year=academic_year,
        keywords=keywords_json,
        technology_stack=technologies_json,
        chroma_document_id=project_id
        # department_id and document_path are optional and can remain None for now
    )

    # 4. Insert and commit to PostgreSQL
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project
