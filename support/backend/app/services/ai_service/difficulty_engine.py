"""
difficulty_engine.py - Project complexity and difficulty estimation engine.
"""
from typing import Any
from langchain_core.prompts import ChatPromptTemplate
from app.services.ai_service.gemini_client import get_llm

__all__ = ["estimate_project_difficulty"]

DIFFICULTY_PROMPT = """
You are a senior computer science capstone evaluation committee member.

Analyze the following project proposal and estimate its technical complexity and implementation difficulty.

PROPOSAL:
Title: {proposal_title}
Abstract: {proposal_abstract}
Problem Statement: {proposal_problem}
Tech Stack: {tech_stack}

Please provide a structured difficulty evaluation formatted as follows:

1. Difficulty Score: X / 10
2. Complexity Tier: [Beginner / Intermediate / Advanced / Expert]
3. Estimated Development Time: [e.g., 2-3 months / 4-6 months]
4. Key Technical Challenges:
   - Challenge 1: ...
   - Challenge 2: ...
5. Prerequisite Knowledge Needed:
   - Skill 1, Skill 2, Skill 3

Keep the evaluation realistic, fair, and constructive for undergraduate capstone students.
"""


def estimate_project_difficulty(
    proposal_title: str,
    proposal_abstract: str,
    proposal_problem: str | None = None,
    tech_stack: str | None = None,
) -> str:
    """
    Uses Gemini LLM to estimate technical difficulty and scope for a capstone proposal.

    Args:
        proposal_title: Title of the proposal.
        proposal_abstract: Abstract text describing the proposal.
        proposal_problem: Optional problem statement text.
        tech_stack: Optional proposed technology stack.

    Returns:
        Structured string containing difficulty score (1-10), tier, challenges, and prerequisites.
    """
    prompt = ChatPromptTemplate.from_template(DIFFICULTY_PROMPT)
    llm = get_llm()
    chain = prompt | llm

    response = chain.invoke({
        "proposal_title": proposal_title,
        "proposal_abstract": proposal_abstract,
        "proposal_problem": proposal_problem or "Not specified",
        "tech_stack": tech_stack or "Not specified",
    })

    return response.content
