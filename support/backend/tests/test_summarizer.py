import sys
from pathlib import Path
from dotenv import load_dotenv

current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent 
sys.path.append(str(backend_dir))
load_dotenv(backend_dir.parent.parent / ".env")

from app.services.ai_service.summarizer import generate_summary

def test():
    # Let's pretend a student submitted this messy proposal
    fake_proposal = """
    My project is a drone-based delivery system for university campuses. 
    Currently, students have to walk long distances between dorms and academic buildings just to deliver small items or documents. 
    I plan to build a mobile app where students can request a delivery, and a quadcopter will autonomously navigate to the GPS coordinates. 
    I will use React Native for the app, Python for the backend routing, and C++ for the drone flight controller.
    """
    
    print("Testing Summarizer on a fake proposal...")
    summary = generate_summary(fake_proposal)
    print("\n--- AI FACULTY SUMMARY ---")
    print(summary)

if __name__ == "__main__":
    test()
