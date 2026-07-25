"""
test_tech_recommender.py - Pytest test cases for the tech stack recommender.
"""
from app.services.ai_service.tech_recommender import recommend_tech_stack


def test_recommend_tech_stack_returns_formatted_string():
    """Verify that recommend_tech_stack returns a structured recommendation string."""
    mock_similar_matches = [
        {
            "title": "Automated Plant Disease Detection using Deep Learning",
            "document_snippet": "Uses PyTorch, ResNet-50, FastAPI backend, and React Native mobile app for leaf scanning."
        }
    ]

    result = recommend_tech_stack(
        proposal_title="AI Crop Pest & Disease Diagnostic System",
        proposal_abstract="A system that allows farmers to take pictures of infected crops and receive instant disease diagnoses and treatment advice.",
        proposal_problem="Farmers lose crops due to late diagnosis of plant diseases and lack of access to agronomists.",
        similar_matches=mock_similar_matches
    )

    assert isinstance(result, str)
    assert len(result) > 50
    assert "Recommended Frontend" in result or "Frontend" in result


if __name__ == "__main__":
    print("Running Tech Recommender Standalone Test...")

    mock_similar_matches = [
        {
            "title": "Automated Plant Disease Detection using Deep Learning",
            "document_snippet": "Uses PyTorch, ResNet-50, FastAPI backend, and React Native mobile app for leaf scanning."
        }
    ]

    result = recommend_tech_stack(
        proposal_title="AI Crop Pest & Disease Diagnostic System",
        proposal_abstract="A system that allows farmers to take pictures of infected crops and receive instant disease diagnoses and treatment advice.",
        proposal_problem="Farmers lose crops due to late diagnosis of plant diseases and lack of access to agronomists.",
        similar_matches=mock_similar_matches
    )

    print("\n================ TECH STACK RECOMMENDATION REPORT ================\n")
    print(result)
    print("\n===================================================================\n")
