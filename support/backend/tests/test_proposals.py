def test_student_can_submit_a_proposal_and_upload_pdf(
    client,
    create_user,
    auth_headers,
    monkeypatch,
):
    student = create_user(
        email="student@example.com",
        role="student",
    )

    async def fake_save_proposal_pdf(proposal_id, file):
        return f"uploads/proposals/proposal_{proposal_id}_test.pdf"

    monkeypatch.setattr(
        "app.api.routers.proposals.save_proposal_pdf",
        fake_save_proposal_pdf,
    )

    proposal_response = client.post(
        "/proposals",
        headers=auth_headers(student),
        json={
            "title": "Campus Maintenance Tracker",
            "abstract": (
                "A project for reporting, assigning, and tracking "
                "campus maintenance issues."
            ),
        },
    )

    assert proposal_response.status_code == 201
    proposal_id = proposal_response.json()["id"]

    upload_response = client.post(
        f"/proposals/{proposal_id}/document",
        headers=auth_headers(student),
        files={
            "file": (
                "proposal.pdf",
                b"%PDF-1.4 test file",
                "application/pdf",
            )
        },
    )

    assert upload_response.status_code == 201
    assert upload_response.json()["document_path"].endswith(".pdf")


def test_student_cannot_select_a_student_as_supervisor(
    client,
    create_user,
    auth_headers,
):
    student = create_user(
        email="student@example.com",
        role="student",
    )
    invalid_supervisor = create_user(
        email="another-student@example.com",
        role="student",
    )

    response = client.post(
        "/proposals",
        headers=auth_headers(student),
        json={
            "title": "Campus Maintenance Tracker",
            "abstract": (
                "A project for reporting, assigning, and tracking "
                "campus maintenance issues."
            ),
            "supervisor_id": invalid_supervisor.id,
        },
    )

    assert response.status_code == 422