"""
seed_archive.py - Ingestion pipeline coordinator
Run this script from the `support/backend` directory.
"""
import sys
from pathlib import Path

# Ensures Python can find the 'app' and 'ingestion' packages in the backend folder
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent / "backend"  # Explicitly go to support/backend
sys.path.append(str(backend_dir))


import chromadb
from app.db.session import SessionLocal
from ingestion.metadata_loader import load_metadata
from ingestion.postgres_loader import load_to_postgres
from ingestion.embedding_generator import generate_embedding
from ingestion.chroma_loader import load_to_chroma

def seed():
    # Setup Paths
    projects_dir = backend_dir / "knowledge_base" / "projects"
    
    if not projects_dir.exists():
        print(f"Directory not found: {projects_dir}")
        return

    # Initialize Database Clients
    db = SessionLocal()
    chroma_client = chromadb.HttpClient(host="localhost", port=8001)
    
    try:
        # Scan knowledge_base/projects/
        for project_folder in sorted(projects_dir.iterdir()):
            if not project_folder.is_dir():
                continue
                
            project_json_path = project_folder / "project.json"
            if not project_json_path.exists():
                continue
                
            print(f"Loading {project_folder.name}...")
            
            # 1. Load & Validate
            project_data = load_metadata(project_json_path)
            print("Validated.")
            
            # 2. Insert into PostgreSQL
            load_to_postgres(project_data, db)
            print("Inserted into PostgreSQL.")
            
            # 3. Generate Embeddings
            document_text, vector = generate_embedding(project_data)
            print("Embedding generated.")
            
            # 4. Store in ChromaDB
            load_to_chroma(project_data, document_text, vector, chroma_client)
            print("Stored in ChromaDB.")
            
            print("Completed.\n")
            
    except Exception as e:
        import traceback
        print(f"Pipeline failed: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting Ingestion Pipeline...")
    seed()
    print("All projects processed successfully.")

