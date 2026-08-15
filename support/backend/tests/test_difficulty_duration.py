"""
test_difficulty_duration.py - Unit tests for difficulty and 1 hr/day duration analyzer.
"""
from app.services.ai_service.difficulty_engine import (
    analyze_project_difficulty_and_duration,
    estimate_project_difficulty,
)


def test_analyze_project_difficulty_and_duration_structure():
    """Verify that analyze_project_difficulty_and_duration returns complete structured data with 1 hr/day constraint."""
    result = analyze_project_difficulty_and_duration(
        proposal_title="Autonomous Drone Navigation with Computer Vision",
        proposal_abstract="Real-time depth estimation using OpenCV and PyTorch deployed on Jetson Nano.",
        proposal_problem="Drones fail in GPS-denied environments.",
        tech_stack="PyTorch, OpenCV, ROS2, Jetson Nano",
        objectives="1. Deploy model on edge. 2. Avoid indoor obstacles.",
        methodology="Stereoscopic vision depth maps.",
    )

    assert isinstance(result, dict)
    assert "difficulty_score" in result
    assert 1.0 <= result["difficulty_score"] <= 10.0
    assert "complexity_tier" in result
    assert result["complexity_tier"] in ["Beginner", "Intermediate", "Advanced", "Expert"]
    assert "estimated_total_hours" in result
    assert "estimated_duration_days" in result
    # Verify 1 hr/day relationship
    assert result["estimated_duration_days"] == result["estimated_total_hours"]
    assert "daily_work_rate" in result
    assert result["daily_work_rate"] == "1 hour per day"
    assert "summary" in result
    assert isinstance(result["challenges"], list)
    assert isinstance(result["prerequisites"], list)


def test_estimate_project_difficulty_legacy_string():
    """Verify legacy estimate_project_difficulty returns string without raising errors."""
    result = estimate_project_difficulty(
        proposal_title="Smart Campus Maintenance Tracker",
        proposal_abstract="A web dashboard for reporting student complaints.",
        proposal_problem="Manual reporting takes too long.",
        tech_stack="React, FastAPI, PostgreSQL",
    )

    assert isinstance(result, str)
    assert len(result) > 20


if __name__ == "__main__":
    test_analyze_project_difficulty_and_duration_structure()
    test_estimate_project_difficulty_legacy_string()
    print("All difficulty & duration engine unit tests passed!")
