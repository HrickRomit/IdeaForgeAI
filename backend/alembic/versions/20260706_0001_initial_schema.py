"""Initial database schema.

Revision ID: 20260706_0001
Revises:
Create Date: 2026-07-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260706_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_departments")),
        sa.UniqueConstraint("code", name=op.f("uq_departments_code")),
        sa.UniqueConstraint("name", name=op.f("uq_departments_name")),
    )
    op.create_index(op.f("ix_departments_id"), "departments", ["id"], unique=False)

    op.create_table(
        "archived_projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("abstract", sa.Text(), nullable=False),
        sa.Column("authors", sa.Text(), nullable=True),
        sa.Column("supervisor_name", sa.String(length=120), nullable=True),
        sa.Column("academic_year", sa.String(length=20), nullable=True),
        sa.Column("keywords", sa.Text(), nullable=True),
        sa.Column("technology_stack", sa.Text(), nullable=True),
        sa.Column("document_path", sa.String(length=500), nullable=True),
        sa.Column("chroma_document_id", sa.String(length=120), nullable=True),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], name=op.f("fk_archived_projects_department_id_departments")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_archived_projects")),
        sa.UniqueConstraint("chroma_document_id", name=op.f("uq_archived_projects_chroma_document_id")),
    )
    op.create_index(op.f("ix_archived_projects_academic_year"), "archived_projects", ["academic_year"], unique=False)
    op.create_index(op.f("ix_archived_projects_id"), "archived_projects", ["id"], unique=False)
    op.create_index(op.f("ix_archived_projects_title"), "archived_projects", ["title"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.Column("student_id", sa.String(length=50), nullable=True),
        sa.Column("faculty_id", sa.String(length=50), nullable=True),
        sa.Column("research_interests", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], name=op.f("fk_users_department_id_departments")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("faculty_id", name=op.f("uq_users_faculty_id")),
        sa.UniqueConstraint("student_id", name=op.f("uq_users_student_id")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_role"), "users", ["role"], unique=False)

    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_chat_sessions_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_chat_sessions")),
    )
    op.create_index(op.f("ix_chat_sessions_id"), "chat_sessions", ["id"], unique=False)

    op.create_table(
        "proposals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("abstract", sa.Text(), nullable=False),
        sa.Column("problem_statement", sa.Text(), nullable=True),
        sa.Column("objectives", sa.Text(), nullable=True),
        sa.Column("methodology", sa.Text(), nullable=True),
        sa.Column("technology_stack", sa.Text(), nullable=True),
        sa.Column("document_path", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("supervisor_id", sa.Integer(), nullable=True),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], name=op.f("fk_proposals_department_id_departments")),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], name=op.f("fk_proposals_student_id_users")),
        sa.ForeignKeyConstraint(["supervisor_id"], ["users.id"], name=op.f("fk_proposals_supervisor_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_proposals")),
    )
    op.create_index(op.f("ix_proposals_id"), "proposals", ["id"], unique=False)
    op.create_index(op.f("ix_proposals_status"), "proposals", ["status"], unique=False)
    op.create_index(op.f("ix_proposals_title"), "proposals", ["title"], unique=False)

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sources", sa.Text(), nullable=True),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["chat_sessions.id"], name=op.f("fk_chat_messages_session_id_chat_sessions")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_chat_messages")),
    )
    op.create_index(op.f("ix_chat_messages_id"), "chat_messages", ["id"], unique=False)

    op.create_table(
        "recommendations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=60), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("proposal_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["proposal_id"], ["proposals.id"], name=op.f("fk_recommendations_proposal_id_proposals")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_recommendations_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_recommendations")),
    )
    op.create_index(op.f("ix_recommendations_category"), "recommendations", ["category"], unique=False)
    op.create_index(op.f("ix_recommendations_id"), "recommendations", ["id"], unique=False)

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("decision", sa.String(length=40), nullable=False),
        sa.Column("comments", sa.Text(), nullable=True),
        sa.Column("proposal_id", sa.Integer(), nullable=False),
        sa.Column("reviewer_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["proposal_id"], ["proposals.id"], name=op.f("fk_reviews_proposal_id_proposals")),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"], name=op.f("fk_reviews_reviewer_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reviews")),
    )
    op.create_index(op.f("ix_reviews_decision"), "reviews", ["decision"], unique=False)
    op.create_index(op.f("ix_reviews_id"), "reviews", ["id"], unique=False)

    op.create_table(
        "similarity_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=False),
        sa.Column("novelty_score", sa.Float(), nullable=True),
        sa.Column("matched_sections", sa.JSON(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("proposal_id", sa.Integer(), nullable=False),
        sa.Column("archived_project_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["archived_project_id"],
            ["archived_projects.id"],
            name=op.f("fk_similarity_reports_archived_project_id_archived_projects"),
        ),
        sa.ForeignKeyConstraint(["proposal_id"], ["proposals.id"], name=op.f("fk_similarity_reports_proposal_id_proposals")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_similarity_reports")),
    )
    op.create_index(op.f("ix_similarity_reports_id"), "similarity_reports", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_similarity_reports_id"), table_name="similarity_reports")
    op.drop_table("similarity_reports")
    op.drop_index(op.f("ix_reviews_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_decision"), table_name="reviews")
    op.drop_table("reviews")
    op.drop_index(op.f("ix_recommendations_id"), table_name="recommendations")
    op.drop_index(op.f("ix_recommendations_category"), table_name="recommendations")
    op.drop_table("recommendations")
    op.drop_index(op.f("ix_chat_messages_id"), table_name="chat_messages")
    op.drop_table("chat_messages")
    op.drop_index(op.f("ix_proposals_title"), table_name="proposals")
    op.drop_index(op.f("ix_proposals_status"), table_name="proposals")
    op.drop_index(op.f("ix_proposals_id"), table_name="proposals")
    op.drop_table("proposals")
    op.drop_index(op.f("ix_chat_sessions_id"), table_name="chat_sessions")
    op.drop_table("chat_sessions")
    op.drop_index(op.f("ix_users_role"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_index(op.f("ix_archived_projects_title"), table_name="archived_projects")
    op.drop_index(op.f("ix_archived_projects_id"), table_name="archived_projects")
    op.drop_index(op.f("ix_archived_projects_academic_year"), table_name="archived_projects")
    op.drop_table("archived_projects")
    op.drop_index(op.f("ix_departments_id"), table_name="departments")
    op.drop_table("departments")
