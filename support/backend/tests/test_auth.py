def test_login_refresh_and_current_user(client, create_user):
    user = create_user(
        email="student@example.com",
        password="Password123",
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "student@example.com",
            "password": "Password123",
        },
    )

    assert login_response.status_code == 200

    login_data = login_response.json()
    assert login_data["access_token"]
    assert login_data["refresh_token"]
    assert login_data["user"]["id"] == user.id

    me_response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {login_data['access_token']}",
        },
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "student@example.com"

    refresh_response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": login_data["refresh_token"],
        },
    )

    assert refresh_response.status_code == 200
    assert refresh_response.json()["access_token"]
    assert refresh_response.json()["refresh_token"]


def test_refresh_token_cannot_access_protected_routes(client, create_user):
    create_user(
        email="student@example.com",
        password="Password123",
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "student@example.com",
            "password": "Password123",
        },
    )

    refresh_token = login_response.json()["refresh_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )

    assert response.status_code == 401


def test_public_registration_cannot_create_admin(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Unauthorized Admin",
            "email": "admin@example.com",
            "password": "Password123",
            "role": "admin",
        },
    )

    assert response.status_code == 403


def test_public_registration_stores_student_id_and_department_code(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Ayesha Rahman",
            "email": "ayesha@example.com",
            "password": "Password123",
            "role": "student",
            "student_id": "CSE-2026-001",
            "department_code": "CSE",
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["student_id"] == "CSE-2026-001"
    assert data["department_id"] is not None
    assert data["department_code"] == "CSE"
    assert data["department_name"] == "Computer Science and Engineering"
