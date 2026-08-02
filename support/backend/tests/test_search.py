def test_authenticated_user_can_search_archives(
    client,
    create_user,
    auth_headers,
    monkeypatch,
):
    user = create_user()

    monkeypatch.setattr(
        "app.api.routers.projects.search_projects",
        lambda query, top_k: [
            {
                "project_id": "project_0001",
                "document": "Smart campus maintenance project",
                "metadata": {
                    "title": "Smart Campus",
                    "academic_year": "2025-2026",
                },
                "distance_score": 0.12,
            }
        ],
    )

    response = client.get(
        "/projects/search",
        params={"q": "campus maintenance"},
        headers=auth_headers(user),
    )

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["results"][0]["project_id"] == "project_0001"


def test_search_requires_login(client):
    response = client.get(
        "/projects/search",
        params={"q": "campus maintenance"},
    )

    assert response.status_code == 401