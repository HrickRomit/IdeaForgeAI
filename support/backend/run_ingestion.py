import glob
from pathlib import Path

# Import database session
from app.db.session import SessionLocal

# Import ingestion modules
from ingestion.metadata_loader import load_metadata
from ingestion.embedding_generator import generate_embedding
from ingestion.chroma_loader import load_to_chroma
from ingestion.postgres_loader import load_to_postgres

def main():
    print("Starting Project Ingestion...")
    
    # 1. Connect to PostgreSQL
    db = SessionLocal()
    
    try:
        # 2. Find all project.json files in the knowledge base
        kb_dir = Path("knowledge_base/projects")
        project_files = glob.glob(str(kb_dir / "project_*" / "project.json"))
        
        if not project_files:
            print("No project.json files found.")
            return
            
        print(f"Found {len(project_files)} projects to ingest.")
        
        # 3. Loop through and process each file
        for file_path in project_files:
            print(f"\nProcessing {file_path}...")
            
            try:
                # Step A: Validate and load the JSON data against the schema
                project_data = load_metadata(file_path)
                
                # Step B: Combine fields into a searchable document and generate vector embedding
                document_text, embedding_vector = generate_embedding(project_data)
                
                # Step C: Upsert into ChromaDB for semantic search
                project_id = load_to_chroma(
                    project_data=project_data,
                    document_text=document_text,
                    embedding=embedding_vector
                )
                print(f"  ✓ Loaded into ChromaDB (ID: {project_id})")
                
                # Step D: Insert into PostgreSQL for relational queries and dashboards
                postgres_record = load_to_postgres(
                    project_data=project_data,
                    db=db
                )
                print(f"  ✓ Loaded into PostgreSQL (ID: {postgres_record.chroma_document_id})")
                
            except Exception as e:
                print(f"  ✗ Error processing {file_path}: {e}")
                
    finally:
        # 4. Clean up database connection
        db.close()
        print("\nIngestion complete.")

if __name__ == "__main__":
    main()
