def test_chat_message_creates_session_and_returns_rag_answer(
    client,
    create_user,
    auth_headers,
    monkeypatch,
):
    user = create_user()

    mock_results = [
        {
            "project_id": "project_0001",
            "document": "Smart campus maintenance project",
            "metadata": {"title": "Smart Campus"},
            "distance_score": 0.12,
        }
    ]

    monkeypatch.setattr(
        "app.api.routers.chat.search_projects",
        lambda question, top_k: mock_results,
    )
    monkeypatch.setattr(
        "app.api.routers.chat.ask_chatbot",
        lambda question, proposal_context=None: "The Smart Campus project used FastAPI and React.",
    )

    response = client.post(
        "/chat/message",
        headers=auth_headers(user),
        json={
            "message": "What technologies did Smart Campus use?",
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["session_id"]
    assert data["answer"] == "The Smart Campus project used FastAPI and React."
    assert data["sources"][0]["project_id"] == "project_0001"


def test_chat_message_with_proposal_context(
    client,
    create_user,
    auth_headers,
    monkeypatch,
):
    user = create_user()
    captured_context = []

    def mock_ask(question, proposal_context=None):
        captured_context.append(proposal_context)
        return f"Reviewed proposal '{proposal_context.get('title')}' successfully."

    monkeypatch.setattr(
        "app.api.routers.chat.search_projects",
        lambda question, top_k: [],
    )
    monkeypatch.setattr("app.api.routers.chat.ask_chatbot", mock_ask)

    response = client.post(
        "/chat/message",
        headers=auth_headers(user),
        json={
            "message": "Summarize this project",
            "proposal_context": {
                "title": "AI Autonomous Vehicle Navigation",
                "abstract": "Self-driving car software using computer vision",
            },
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert "AI Autonomous Vehicle Navigation" in data["answer"]
    assert captured_context[0]["title"] == "AI Autonomous Vehicle Navigation"