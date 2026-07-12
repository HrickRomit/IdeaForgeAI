"""Chat tests placeholder."""
import sys
from pathlib import Path
from dotenv import load_dotenv

# Connect to backend
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent 
sys.path.append(str(backend_dir))

# Load your new .env file securely
load_dotenv(backend_dir.parent.parent / ".env")

from app.services.ai_service.chatbot import ask_chatbot

def test_ai():
    question = "Can you summarize the technologies used in the Smart Campus project?"
    print(f"Student: {question}")
    print("\nIdeaForge AI is thinking...\n")
    
    try:
        answer = ask_chatbot(question)
        print(f"🤖 IdeaForge AI:\n{answer}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai()
