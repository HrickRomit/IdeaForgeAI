import sys
from pathlib import Path

# Connect to the backend (one folder up from /tests)
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))

from app.services.ai_service.search_engine import search_projects

def run_test():
    query = "I want to build a system for tracking maintenance and facility issues"
    print(f"🔍 Searching for: '{query}'\n")

    # Call the semantic search engine you just built!
    results = search_projects(query, top_k=2)

    if not results:
        print("No projects found. Did you run seed_archive.py?")
        return

    print(f"✅ Found {len(results)} matches!\n")

    for i, res in enumerate(results):
        print(f"--- MATCH {i+1} ---")
        print(f"Project ID: {res['project_id']}")
        print(f"Similarity Distance: {res['distance_score']:.4f}")

        metadata = res['metadata']
        print(f"Title: {metadata.get('title')}")
        print(f"Keywords: {metadata.get('keywords')}")
        print("-" * 40 + "\n")

if __name__ == "__main__":
    run_test()
