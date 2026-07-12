"""
chatbot.py - RAG Chatbot using Semantic Search and Gemini
"""
from langchain_core.prompts import ChatPromptTemplate
from app.services.ai_service.gemini_client import get_llm
from app.services.ai_service.search_engine import search_projects

__all__ = ["ask_chatbot"]

# This prompt strictly grounds the AI to your database
RAG_PROMPT = """
You are IdeaForge AI, an intelligent assistant helping university students with academic projects.
Answer the user's question based ONLY on the following archived projects retrieved from our database. 

If the answer cannot be found in the provided projects, say "I couldn't find any specific information about that in the archives." Do not invent or hallucinate projects.

RETRIEVED PROJECTS:
{context}

USER QUESTION: 
{question}
"""

def ask_chatbot(question: str) -> str:
    """
    Retrieves relevant projects and asks Gemini to answer the question based on them.
    """
    # 1. Retrieve the top 3 most relevant projects from our Semantic Search Engine
    results = search_projects(question, top_k=3)
    
    # 2. Build the context string from the retrieved documents
    context_parts = []
    for i, res in enumerate(results):
        meta = res.get('metadata', {})
        doc = res.get('document', '')
        title = meta.get('title', 'Unknown Project')
        context_parts.append(f"--- PROJECT {i+1}: {title} ---\n{doc}\n")
        
    context = "\n".join(context_parts)
    
    # 3. Create the LangChain Prompt
    prompt = ChatPromptTemplate.from_template(RAG_PROMPT)
    
    # 4. Get the LLM and link it to the prompt
    llm = get_llm()
    chain = prompt | llm
    
    # 5. Execute the pipeline!
    response = chain.invoke({
        "context": context,
        "question": question
    })
    
    return response.content
