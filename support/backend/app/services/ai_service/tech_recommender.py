"""
tech_recommender.py - Technology stack recommendation engine for student proposals.
"""
from typing import Any
from langchain_core.prompts import ChatPromptTemplate
from app.services.ai_service.gemini_client import get_llm

__all__ = ["recommend_tech_stack"]

TECH_RECOMMENDER_PROMPT = """
You are a senior software architect and academic capstone advisor. 

Based on the following student project proposal, recommend a complete, modern, industry-standard technology stack.

STUDENT PROPOSAL:
Title: {proposal_title}
Abstract: {proposal_abstract}
Problem Statement: {proposal_problem}

SIMILAR PAST PROJECTS CONTEXT:
{similar_projects_context}

Please provide a structured tech stack recommendation formatted as follows:

1. Recommended Frontend:
   - Framework & UI libraries + short justification.
2. Recommended Backend & API:
   - Framework & server tools + short justification.
3. Recommended Database & Storage:
   - Relational, Vector, or NoSQL databases required + justification.
4. Recommended AI / Data Libraries (if applicable):
   - Specific ML/NLP/CV packages needed + justification.
5. Recommended Infrastructure & Hosting:
   - Containerization & cloud hosting platforms.

Keep the recommendations pragmatic, modern, and achievable for a student capstone project.
"""


def recommend_tech_stack(
    proposal_title: str,
    proposal_abstract: str,
    proposal_problem: str | None = None,
    similar_matches: list[dict[str, Any]] | None = None,
) -> str:
    """
    Uses Gemini LLM to generate technical stack recommendations tailored for a proposal.

    Args:
        proposal_title: Title of the proposal.
        proposal_abstract: Abstract text describing the proposal.
        proposal_problem: Optional problem statement text.
        similar_matches: Optional list of top similar archived project dicts.

    Returns:
        Structured string containing tech stack recommendations and technical justification.
    """
    if not similar_matches:
        context_str = "No specific similar project tech stacks were provided."
    else:
        parts = []
        for i, match in enumerate(similar_matches[:3]):
            title = match.get("title", "Archived Project")
            snippet = match.get("document_snippet", "")
            parts.append(f"--- SIMILAR PAST PROJECT {i+1}: {title} ---\n{snippet}\n")
        context_str = "\n".join(parts)

    prompt = ChatPromptTemplate.from_template(TECH_RECOMMENDER_PROMPT)
    llm = get_llm()
    chain = prompt | llm

    response = chain.invoke({
        "proposal_title": proposal_title,
        "proposal_abstract": proposal_abstract,
        "proposal_problem": proposal_problem or "Not specified",
        "similar_projects_context": context_str,
    })

    return response.content
