"""Novelty engine placeholder."""
"""
novelty_engine.py - Novelty analysis engine comparing proposals against top similar matches.
"""
from typing import Any
from langchain_core.prompts import ChatPromptTemplate
from app.services.ai_service.gemini_client import get_llm

__all__ = ["analyze_proposal_novelty"]

NOVELTY_PROMPT = """
You are an expert academic project evaluator. Analyze the following student project proposal against the top similar archived projects retrieved from our database.

STUDENT PROPOSAL:
Title: {proposal_title}
Abstract: {proposal_abstract}
Problem Statement: {proposal_problem}

TOP SIMILAR ARCHIVED PROJECTS:
{similar_projects_context}

Please provide a structured novelty evaluation with:
1. Novelty Assessment (What is unique or original about this proposal compared to prior work?)
2. Overlap Details (What aspects are already done in the archived projects?)
3. Recommendations to Enhance Originality (2 concrete suggestions for the student)

Be concise, academic, and constructive.
"""


def analyze_proposal_novelty(
    proposal_title: str,
    proposal_abstract: str,
    proposal_problem: str | None = None,
    similar_matches: list[dict[str, Any]] | None = None,
) -> str:
    """
    Uses Gemini LLM to compare a proposal against top matching archived projects
    and generate a detailed novelty analysis report.
    """
    if not similar_matches:
        context_str = "No close similar projects were found in the database archive."
    else:
        parts = []
        for i, match in enumerate(similar_matches[:3]):
            title = match.get("title", "Archived Project")
            snippet = match.get("document_snippet", "")
            score = match.get("similarity_score", 0.0)
            parts.append(f"--- MATCH {i+1}: {title} (Similarity: {score*100:.1f}%) ---\n{snippet}\n")
        context_str = "\n".join(parts)

    prompt = ChatPromptTemplate.from_template(NOVELTY_PROMPT)
    llm = get_llm()
    chain = prompt | llm

    response = chain.invoke({
        "proposal_title": proposal_title,
        "proposal_abstract": proposal_abstract,
        "proposal_problem": proposal_problem or "Not specified",
        "similar_projects_context": context_str,
    })

    return response.content
