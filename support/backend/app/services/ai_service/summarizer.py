"""
summarizer.py - AI Proposal Summarizer
"""
from langchain_core.prompts import ChatPromptTemplate
from app.services.ai_service.gemini_client import get_llm

__all__ = ["generate_summary"]

SUMMARY_PROMPT = """
You are a faculty assistant reviewing a student capstone project proposal.
Please summarize the following proposal into exactly 3 concise bullet points.
Focus on:
1. What the project is.
2. The core problem it solves.
3. The main technology stack.

STUDENT PROPOSAL:
{proposal_text}
"""

def generate_summary(proposal_text: str) -> str:
    """
    Generates a concise 3-bullet-point summary of a student's proposal for faculty review.
    """
    prompt = ChatPromptTemplate.from_template(SUMMARY_PROMPT)
    llm = get_llm()
    
    chain = prompt | llm
    
    response = chain.invoke({
        "proposal_text": proposal_text
    })
    
    return response.content
