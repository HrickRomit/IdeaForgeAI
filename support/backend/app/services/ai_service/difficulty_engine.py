"""
difficulty_engine.py - Project complexity, difficulty, and duration estimation engine.
"""
import json
import re
from typing import Any

from langchain_core.prompts import ChatPromptTemplate

from app.services.ai_service.gemini_client import get_llm

__all__ = ["estimate_project_difficulty", "analyze_project_difficulty_and_duration"]

DIFFICULTY_PROMPT = """
You are a senior computer science capstone evaluator.

Analyze the following project proposal and provide a brief, concise technical difficulty assessment.

PROPOSAL:
Title: {proposal_title}
Abstract: {proposal_abstract}
Problem Statement: {proposal_problem}
Tech Stack: {tech_stack}

Please provide a concise difficulty evaluation (keep it short and to the point):

1. Difficulty Score: X / 10
2. Complexity Tier: [Beginner / Intermediate / Advanced / Expert]
3. Estimated Development Time: [e.g., 2-3 months / 4-6 months]
4. Key Technical Challenges (max 2 brief points):
   - Challenge 1
   - Challenge 2
5. Prerequisite Knowledge Needed (comma-separated):
   - Skill 1, Skill 2, Skill 3

Keep all points brief and direct.
"""

DIFFICULTY_DURATION_JSON_PROMPT = """
You are a senior software engineering project manager and academic capstone evaluator.

Analyze the following project proposal and estimate its technical difficulty (1-10), complexity tier, total development hours required, and estimated duration in days assuming the student works on the project for 1 hour per day.

PROPOSAL DETAILS:
Title: {proposal_title}
Abstract: {proposal_abstract}
Problem Statement: {proposal_problem}
Objectives: {proposal_objectives}
Methodology: {proposal_methodology}
Tech Stack: {tech_stack}

Return strictly a valid JSON object (and nothing else) adhering to the following structure:
{{
  "difficulty_score": 7.5,
  "complexity_tier": "Advanced",
  "estimated_total_hours": 60,
  "estimated_duration_days": 60,
  "daily_work_rate": "1 hour per day",
  "summary": "1-2 short, punchy sentences explaining the score and timeline.",
  "challenges": [
    "Short 1-line challenge (max 12 words)",
    "Short 1-line challenge (max 12 words)"
  ],
  "prerequisites": [
    "Skill or technology name",
    "Skill or technology name"
  ]
}}

Rules:
1. "difficulty_score" must be a float between 1.0 and 10.0.
2. "complexity_tier" must be one of: "Beginner", "Intermediate", "Advanced", "Expert".
3. "estimated_total_hours" must be a positive integer reflecting standard undergraduate capstone scope (e.g., 30 to 120 hours).
4. "estimated_duration_days" MUST equal "estimated_total_hours" because the daily work rate is strictly 1 hour per day.
5. "summary": Strictly 1 to 2 short, crisp sentences (max 30 words total).
6. "challenges": Exactly 2 to 3 concise, single-line items (max 12-15 words each).
7. "prerequisites": 2 to 3 concise skill/tool names (e.g., "PyTorch & Computer Vision", "FastAPI / PostgreSQL").
8. Provide only valid JSON. Do not include markdown code block backticks.
"""

COMPLEX_KEYWORDS = [
    "ai", "ml", "machine learning", "deep learning", "neural network", "computer vision",
    "opencv", "pytorch", "tensorflow", "yolo", "nlp", "llm", "rag", "transformer",
    "blockchain", "smart contract", "crypto", "security", "encryption",
    "microservices", "distributed", "kubernetes", "docker", "kafka", "real-time",
    "iot", "embedded", "ros", "ros2", "jetson", "robotics", "drone", "compiler",
    "assembly", "vulnerability", "malware", "biometrics", "cloud native",
]

INTERMEDIATE_KEYWORDS = [
    "react", "vue", "angular", "fastapi", "django", "flask", "node", "express",
    "postgresql", "mysql", "mongodb", "redis", "rest api", "graphql", "authentication",
    "oauth", "dashboard", "analytics", "search", "mobile app", "flutter",
]


def _heuristic_difficulty_duration(
    proposal_title: str,
    proposal_abstract: str,
    proposal_problem: str | None = None,
    tech_stack: str | None = None,
    objectives: str | None = None,
    methodology: str | None = None,
) -> dict[str, Any]:
    combined_text = f"{proposal_title} {proposal_abstract} {proposal_problem or ''} {tech_stack or ''} {objectives or ''} {methodology or ''}".lower()

    complex_matches = sum(1 for kw in COMPLEX_KEYWORDS if kw in combined_text)
    intermediate_matches = sum(1 for kw in INTERMEDIATE_KEYWORDS if kw in combined_text)
    text_length = len(combined_text)

    base_score = 5.0 + (complex_matches * 0.8) + (intermediate_matches * 0.3)
    if text_length > 400:
        base_score += 0.5
    if text_length > 800:
        base_score += 0.5

    difficulty_score = round(min(max(base_score, 3.5), 9.5), 1)

    if difficulty_score < 5.0:
        complexity_tier = "Beginner"
        total_hours = int(difficulty_score * 8)
    elif difficulty_score < 7.0:
        complexity_tier = "Intermediate"
        total_hours = int(difficulty_score * 8.5)
    elif difficulty_score < 8.8:
        complexity_tier = "Advanced"
        total_hours = int(difficulty_score * 9.0)
    else:
        complexity_tier = "Expert"
        total_hours = int(difficulty_score * 10.0)

    duration_days = total_hours  # 1 hour per day work rate

    challenges = []
    if complex_matches > 0:
        challenges.append("Integration and optimization of advanced algorithmic models.")
    challenges.append("System architectural design and state management.")
    challenges.append("Comprehensive testing, deployment, and performance evaluation.")

    prerequisites = []
    if "python" in combined_text or "fastapi" in combined_text or "pytorch" in combined_text:
        prerequisites.append("Python & Data Structures")
    if "react" in combined_text or "javascript" in combined_text:
        prerequisites.append("Frontend State & API Integration")
    if "db" in combined_text or "sql" in combined_text or "postgres" in combined_text:
        prerequisites.append("Database Modeling & Queries")
    if not prerequisites:
        prerequisites = ["Software Design", "Web Development", "Version Control (Git)"]

    return {
        "difficulty_score": difficulty_score,
        "complexity_tier": complexity_tier,
        "estimated_total_hours": total_hours,
        "estimated_duration_days": duration_days,
        "daily_work_rate": "1 hour per day",
        "summary": (
            f"Estimated as {complexity_tier} difficulty ({difficulty_score}/10). "
            f"Working 1 hour per day, completing all core modules is projected to take {duration_days} days (~{total_hours} total hours)."
        ),
        "challenges": challenges,
        "prerequisites": prerequisites,
        "raw_evaluation": f"Difficulty: {difficulty_score}/10 ({complexity_tier}). Estimated duration: {duration_days} days @ 1 hr/day.",
    }


def analyze_project_difficulty_and_duration(
    proposal_title: str,
    proposal_abstract: str,
    proposal_problem: str | None = None,
    tech_stack: str | None = None,
    objectives: str | None = None,
    methodology: str | None = None,
) -> dict[str, Any]:
    """
    Analyzes project proposal details and returns structured difficulty score (1-10)
    and duration estimate (in days, assuming 1 hour per day work rate).
    """
    try:
        prompt = ChatPromptTemplate.from_template(DIFFICULTY_DURATION_JSON_PROMPT)
        llm = get_llm()
        chain = prompt | llm

        response = chain.invoke({
            "proposal_title": proposal_title,
            "proposal_abstract": proposal_abstract,
            "proposal_problem": proposal_problem or "Not specified",
            "proposal_objectives": objectives or "Not specified",
            "proposal_methodology": methodology or "Not specified",
            "tech_stack": tech_stack or "Not specified",
        })

        content = response.content.strip()
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n?", "", content)
            content = re.sub(r"\n?```$", "", content).strip()

        data = json.loads(content)
        difficulty_score = float(data.get("difficulty_score", 6.5))
        difficulty_score = round(min(max(difficulty_score, 1.0), 10.0), 1)

        total_hours = int(data.get("estimated_total_hours", int(difficulty_score * 8.5)))
        duration_days = total_hours

        return {
            "difficulty_score": difficulty_score,
            "complexity_tier": str(data.get("complexity_tier", "Intermediate")),
            "estimated_total_hours": total_hours,
            "estimated_duration_days": duration_days,
            "daily_work_rate": "1 hour per day",
            "summary": str(data.get("summary", f"Calculated {difficulty_score}/10 complexity requiring approx {duration_days} days at 1 hr/day.")),
            "challenges": list(data.get("challenges", ["Technical implementation", "System validation"])),
            "prerequisites": list(data.get("prerequisites", ["Software Design", "Programming Fundamentals"])),
            "raw_evaluation": content,
        }
    except Exception:
        return _heuristic_difficulty_duration(
            proposal_title=proposal_title,
            proposal_abstract=proposal_abstract,
            proposal_problem=proposal_problem,
            tech_stack=tech_stack,
            objectives=objectives,
            methodology=methodology,
        )


def estimate_project_difficulty(
    proposal_title: str,
    proposal_abstract: str,
    proposal_problem: str | None = None,
    tech_stack: str | None = None,
) -> str:
    """
    Uses Gemini LLM to estimate technical difficulty and scope for a capstone proposal.
    Backward compatible function returning formatted string evaluation.
    """
    try:
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
    except Exception:
        analysis = _heuristic_difficulty_duration(
            proposal_title=proposal_title,
            proposal_abstract=proposal_abstract,
            proposal_problem=proposal_problem,
            tech_stack=tech_stack,
        )
        return (
            f"1. Difficulty Score: {analysis['difficulty_score']} / 10\n"
            f"2. Complexity Tier: {analysis['complexity_tier']}\n"
            f"3. Estimated Development Time: {analysis['estimated_duration_days']} days (at 1 hour/day)\n"
            f"4. Key Technical Challenges:\n"
            + "\n".join(f"   - {c}" for c in analysis["challenges"]) + "\n"
            f"5. Prerequisite Knowledge Needed:\n"
            + "\n".join(f"   - {p}" for p in analysis["prerequisites"])
        )

