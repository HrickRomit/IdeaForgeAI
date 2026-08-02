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
        lambda question: "The Smart Campus project used FastAPI and React.",
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