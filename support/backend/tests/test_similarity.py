"""
test_similarity.py - Pytest test cases for the similarity engine.
"""
from app.services.ai_service.similarity_engine import check_proposal_similarity


def test_similarity_engine_returns_valid_structure():
    """Verify that check_proposal_similarity returns a valid result dict structure."""
    result = check_proposal_similarity(
        title="Smart Campus Facility & Complaint Tracker",
        abstract="A system for reporting maintenance complaints and tracking resolution status.",
        problem_statement="Manual complaint processing is slow and leads to delayed repair work.",
        top_k=3,
    )

    assert isinstance(result, dict)
    assert "overall_similarity_score" in result
    assert "total_matches_found" in result
    assert "matches" in result
    assert isinstance(result["overall_similarity_score"], float)
    assert 0.0 <= result["overall_similarity_score"] <= 1.0
    assert isinstance(result["matches"], list)


if __name__ == "__main__":
    print("Running Similarity Engine Standalone Test...")
    res = check_proposal_similarity(
        title="Smart Campus Facility & Complaint Tracker",
        abstract="A system for reporting maintenance complaints and tracking resolution status.",
        problem_statement="Manual complaint processing is slow and leads to delayed repair work.",
        top_k=3,
    )
    print("==========================================")
    print(f"Overall Similarity Score: {res['overall_similarity_score'] * 100:.1f}%")
    print(f"Matches Found: {res['total_matches_found']}")
    print("==========================================")
    for match in res["matches"]:
        print(f"- {match['title']} ({match['similarity_score'] * 100:.1f}% score)")
