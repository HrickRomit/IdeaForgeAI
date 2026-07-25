"""
test_novelty.py - Pytest test cases for the novelty engine.
"""
from app.services.ai_service.novelty_engine import analyze_proposal_novelty


def test_novelty_engine_returns_analysis_string():
    """Verify that analyze_proposal_novelty returns a string analysis."""
    # Mocking similar matches returned from the Similarity Engine
    mock_similar_matches = [
        {
            "title": "Smart Campus Maintenance System",
            "similarity_score": 0.75,
            "document_snippet": "A system allowing students to report broken lights and plumbing issues via a web portal."
        }
    ]

    result = analyze_proposal_novelty(
        proposal_title="AI-Powered Campus Complaint Tracker",
        proposal_abstract="A mobile app using AI image recognition to categorize campus facility complaints and automatically route them to the right department.",
        proposal_problem="Manual sorting of complaints delays repairs. Users also submit duplicates.",
        similar_matches=mock_similar_matches
    )

    assert isinstance(result, str)
    assert len(result) > 50  # Ensure the LLM returned a substantial response


if __name__ == "__main__":
    print("Running Novelty Engine Standalone Test (Calling Gemini 3.1 Pro)...")
    
    mock_similar_matches = [
        {
            "title": "Smart Campus Maintenance System",
            "similarity_score": 0.75,
            "document_snippet": "A system allowing students to report broken lights and plumbing issues via a web portal."
        },
        {
            "title": "University Ticket Helpdesk",
            "similarity_score": 0.60,
            "document_snippet": "A general IT and facilities ticketing system for the university."
        }
    ]

    result = analyze_proposal_novelty(
        proposal_title="AI-Powered Campus Complaint Tracker",
        proposal_abstract="A mobile app using AI image recognition to categorize campus facility complaints and automatically route them to the right department.",
        proposal_problem="Manual sorting of complaints delays repairs. Users also submit duplicates.",
        similar_matches=mock_similar_matches
    )

    print("\n================ NOVELTY REPORT ================\n")
    print(result)
    print("\n================================================\n")
