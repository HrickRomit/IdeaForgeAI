"""
chatbot.py - RAG Chatbot using Semantic Search, Proposal Context, and Gemini
"""
import json
from typing import Any

from langchain_core.prompts import ChatPromptTemplate

from app.services.ai_service.gemini_client import get_llm
from app.services.ai_service.search_engine import search_projects

__all__ = ["ask_chatbot"]

# Grounded prompt for general archive Q&A
RAG_GENERAL_PROMPT = """
You are IdeaForge AI, an intelligent academic project assistant helping university students and faculty.
Answer the user's question using the following archived projects retrieved from our database.

If the answer cannot be found in the provided projects and is a general question about project workflows, provide helpful guidance while noting what is in our database.

RETRIEVED ARCHIVED PROJECTS:
{context}

USER QUESTION:
{question}
"""

# Prompt tailored when reviewing a specific submitted proposal
RAG_PROPOSAL_PROMPT = """
You are IdeaForge AI, an intelligent academic project review assistant supporting university faculty, supervisors, and students.

CURRENTLY REVIEWED PROPOSAL DETAILS:
{proposal_details}

RETRIEVED ARCHIVED PROJECTS (FROM DATABASE ARCHIVE):
{context}

USER QUESTION / INSTRUCTION:
{question}

Instructions:
1. Provide a comprehensive, accurate, and helpful answer using both the submitted proposal details above AND any relevant archived project records.
2. If asked about the proposal's title, summary, problem statement, objectives, methodology, technology stack, difficulty, novelty, risks, or review recommendations, analyze the provided proposal details thoroughly.
3. Be professional, clear, concise, and constructive for academic review. Format key points with Markdown bullet lists or bold text when appropriate.
"""


def _format_proposal_context(proposal_context: dict[str, Any] | str) -> str:
    """Formats proposal dictionary or string into a structured markdown block."""
    if isinstance(proposal_context, str):
        return proposal_context

    lines: list[str] = []
    if title := proposal_context.get("title"):
        lines.append(f"Proposal Title: {title}")
    student = proposal_context.get("student_name") or proposal_context.get("student")
    dept = proposal_context.get("department") or proposal_context.get("dept")
    if student:
        dept_str = f" ({dept})" if dept else ""
        lines.append(f"Submitted By: {student}{dept_str}")
    if status := proposal_context.get("status"):
        lines.append(f"Current Status: {status}")

    sim_score = proposal_context.get("similarity_score")
    if sim_score is None:
        sim_score = proposal_context.get("similarity")
    if sim_score is not None:
        lines.append(f"Similarity Score: {sim_score}%")

    if abstract := proposal_context.get("abstract") or proposal_context.get("summary"):
        lines.append(f"Abstract / Summary:\n{abstract}")
    if problem := proposal_context.get("problem_statement") or proposal_context.get("problemStatement"):
        lines.append(f"Problem Statement:\n{problem}")
    if objectives := proposal_context.get("objectives"):
        lines.append(f"Objectives:\n{objectives}")
    if methodology := proposal_context.get("methodology"):
        lines.append(f"Methodology:\n{methodology}")
    if tech_stack := proposal_context.get("technology_stack") or proposal_context.get("technologyStack"):
        lines.append(f"Technology Stack:\n{tech_stack}")
    if notes := proposal_context.get("similarity_notes") or proposal_context.get("novelty_summary"):
        lines.append(f"Similarity / Novelty Notes:\n{notes}")

    return "\n".join(lines) if lines else json.dumps(proposal_context, indent=2)


def ask_chatbot(question: str, proposal_context: dict[str, Any] | str | None = None) -> str:
    """
    Retrieves relevant projects and asks Gemini to answer the question based on them,
    incorporating submitted proposal context when provided.
    """
    # 1. Retrieve the top 3 most relevant projects from our Semantic Search Engine
    results = search_projects(question, top_k=3)

    # 2. Build the context string from the retrieved documents
    context_parts = []
    for i, res in enumerate(results):
        meta = res.get("metadata", {})
        doc = res.get("document", "")
        title = meta.get("title", "Unknown Project")
        context_parts.append(f"--- ARCHIVED PROJECT {i+1}: {title} ---\n{doc}\n")

    context = "\n".join(context_parts) if context_parts else "No specific archived projects found."

    # 3. Choose the appropriate prompt template
    if proposal_context:
        formatted_proposal = _format_proposal_context(proposal_context)
        prompt = ChatPromptTemplate.from_template(RAG_PROPOSAL_PROMPT)
        input_data = {
            "proposal_details": formatted_proposal,
            "context": context,
            "question": question,
        }
    else:
        prompt = ChatPromptTemplate.from_template(RAG_GENERAL_PROMPT)
        input_data = {
            "context": context,
            "question": question,
        }

    # 4. Invoke LLM chain
    llm = get_llm()
    chain = prompt | llm

    response = chain.invoke(input_data)
    return response.content

