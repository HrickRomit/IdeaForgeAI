"""
test_difficulty.py - Pytest test cases for the difficulty estimation engine.
"""
from app.services.ai_service.difficulty_engine import estimate_project_difficulty


def test_estimate_project_difficulty_returns_string():
    """Verify that estimate_project_difficulty returns a structured evaluation string."""
    result = estimate_project_difficulty(
        proposal_title="Autonomous Drone Obstacle Avoidance System",
        proposal_abstract="A real-time Computer Vision system deployed on edge hardware (Jetson Nano) for drone navigation using stereoscopic depth estimation.",
        proposal_problem="Drones crash in indoor environments where GPS signal is unreliable.",
        tech_stack="PyTorch, OpenCV, ROS2, C++, Jetson Nano"
    )

    assert isinstance(result, str)
    assert len(result) > 50
    assert "Difficulty Score" in result or "Difficulty" in result


if __name__ == "__main__":
    print("Running Difficulty Estimation Engine Standalone Test...")

    result = estimate_project_difficulty(
        proposal_title="Autonomous Drone Obstacle Avoidance System",
        proposal_abstract="A real-time Computer Vision system deployed on edge hardware (Jetson Nano) for drone navigation using stereoscopic depth estimation.",
        proposal_problem="Drones crash in indoor environments where GPS signal is unreliable.",
        tech_stack="PyTorch, OpenCV, ROS2, C++, Jetson Nano"
    )

    print("\n================ DIFFICULTY ESTIMATION REPORT ================\n")
    print(result)
    print("\n==============================================================\n")
