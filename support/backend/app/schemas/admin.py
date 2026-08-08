from pydantic import BaseModel


class AdminDashboardStats(BaseModel):
    total_students: int
    total_faculty: int
    total_archived_projects: int