from sentence_transformers import SentenceTransformer

__all__ = ["generate_embedding"]


_embedding_model = None
def get_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        # A fast, reliable local model perfect for document search
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model

def create_searchable_document(project_data: dict) -> str:
    """
    Combines critical fields from the project into a single text block
    optimized for vector search.
    """
    parts = []
    
    # 1. Title
    title = project_data.get("basic_information", {}).get("title", "")
    if title:
        parts.append(f"Title: {title}")
        
    # 2. Abstract
    abstract = project_data.get("abstract", "")
    if abstract:
        parts.append(f"Abstract: {abstract}")
        
    # 3. Problem Statement
    problem = project_data.get("problem_statement", "")
    if problem:
        parts.append(f"Problem Statement: {problem}")
        
    # 4. Objectives
    objs = project_data.get("objectives", {})
    primary_objs = objs.get("primary", [])
    if primary_objs:
        parts.append("Objectives: " + " ".join(primary_objs))
        
    # 5. Features
    features = project_data.get("features", [])
    if features:
        feature_names = [f.get("name", "") for f in features]
        parts.append("Features: " + ", ".join(feature_names))
        
    # 6. Technologies
    tech = project_data.get("technologies", {})
    all_techs = []
    for category in ["programming_languages", "frameworks", "database", "apis", "tools", "platforms"]:
        items = tech.get(category, [])
        all_techs.extend([t.get("name", "") for t in items])
    
    if all_techs:
        parts.append("Technologies: " + ", ".join(all_techs))
        
    # 7. Keywords
    keywords = project_data.get("keywords", [])
    if keywords:
        parts.append("Keywords: " + ", ".join(keywords))
        
    # 8. Future Scope
    future_scope = project_data.get("future_scope", [])
    if future_scope:
        parts.append("Future Scope: " + " ".join(future_scope))
        
    # Combine everything with clear separation
    return "\n\n".join(parts)

def generate_embedding(project_data: dict) -> tuple[str, list[float]]:
    """
    Converts the project data into a searchable document and generates its vector embedding.
    Returns the document text and the embedding vector as a list of floats.
    """
    document_text = create_searchable_document(project_data)
 
    model = get_model()
    # encode() returns a numpy array, so we convert it to a standard Python list
    vector = model.encode(document_text).tolist()
    
    return document_text, vector