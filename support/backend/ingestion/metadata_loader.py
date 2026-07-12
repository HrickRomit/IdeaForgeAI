"""
metadata_loader.py - Loads and validates project.json against the schema.
"""
import json
from pathlib import Path
import jsonschema

__all__ = ["load_metadata"]

# Calculate the path to the schema relative to this file
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
SCHEMA_PATH = BACKEND_DIR / "knowledge_base" / "templates" / "project_schema.json"

def load_metadata(path: str | Path) -> dict:
    """
    Load and validate a project.json file against the project_schema.json.
    Raises meaningful ValueError on validation failure.
    """
    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(f"Project metadata file not found at: {file_path}")

    # Load the JSON data
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            project_data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format in {file_path}: {e}")

    # Load the schema
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Schema file not found at: {SCHEMA_PATH}")

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    # Validate
    try:
        jsonschema.validate(instance=project_data, schema=schema)
    except jsonschema.exceptions.ValidationError as e:
        # Provide a meaningful error message
        path_str = ".".join([str(p) for p in e.absolute_path]) if e.absolute_path else "root"
        raise ValueError(f"Validation failed for field '{path_str}': {e.message}")

    return project_data
