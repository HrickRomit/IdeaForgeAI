def test_non_admin_cannot_use_admin_routes(
    client,
    create_user,
    auth_headers,
):
    student = create_user()

    response = client.get(
        "/admin/users",
        headers=auth_headers(student),
    )

    assert response.status_code == 403


def test_admin_can_manage_departments_and_users(
    client,
    create_user,
    auth_headers,
):
    admin = create_user(
        role="admin",
        email="admin@example.com",
        full_name="System Admin",
    )
    headers = auth_headers(admin)

    department_response = client.post(
        "/admin/departments",
        headers=headers,
        json={
            "name": "Computer Science and Engineering",
            "code": "CSE",
            "description": "Computer Science department",
        },
    )

    assert department_response.status_code == 201
    department_id = department_response.json()["id"]

    user_response = client.post(
        "/admin/users",
        headers=headers,
        json={
            "full_name": "Faculty User",
            "email": "faculty@example.com",
            "password": "Password123",
            "role": "faculty",
            "faculty_id": "CSE-F-001",
            "department_id": department_id,
        },
    )

    assert user_response.status_code == 201
    assert user_response.json()["role"] == "faculty"

    list_response = client.get("/admin/users", headers=headers)

    assert list_response.status_code == 200
    assert len(list_response.json()) == 2


def test_admin_can_manage_archives(
    client,
    create_user,
    auth_headers,
    monkeypatch,
):
    admin = create_user(
        role="admin",
        email="admin@example.com",
    )
    headers = auth_headers(admin)

    monkeypatch.setattr(
        "app.api.routers.admin._sync_archive_to_chroma",
        lambda archive: None,
    )
    monkeypatch.setattr(
        "app.api.routers.admin._remove_archive_from_chroma",
        lambda chroma_document_id: None,
    )

    create_response = client.post(
        "/admin/archive",
        headers=headers,
        json={
            "title": "Smart Campus System",
            "abstract": "A project for campus maintenance issue management.",
            "keywords": ["campus", "maintenance"],
            "technology_stack": ["FastAPI", "React"],
        },
    )

    assert create_response.status_code == 201
    archive_id = create_response.json()["id"]

    update_response = client.patch(
        f"/admin/archive/{archive_id}",
        headers=headers,
        json={
            "academic_year": "2025-2026",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["academic_year"] == "2025-2026"

    delete_response = client.delete(
        f"/admin/archive/{archive_id}",
        headers=headers,
    )

    assert delete_response.status_code == 204