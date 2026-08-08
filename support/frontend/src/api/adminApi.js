export function getAdminDashboardStats() {
  return axiosClient.get("/admin/dashboard");
}
import axiosClient from "./axiosClient";

// Users
export function getAdminUsers(params = {}) {
  return axiosClient.get("/admin/users", { params });
}

export function getAdminUser(userId) {
  return axiosClient.get(`/admin/users/${userId}`);
}

export function createAdminUser(payload) {
  return axiosClient.post("/admin/users", payload);
}

export function updateAdminUser(userId, payload) {
  return axiosClient.patch(`/admin/users/${userId}`, payload);
}

export function deactivateAdminUser(userId) {
  return axiosClient.delete(`/admin/users/${userId}`);
}

// Departments
export function getDepartments() {
  return axiosClient.get("/admin/departments");
}

export function getDepartment(departmentId) {
  return axiosClient.get(`/admin/departments/${departmentId}`);
}

export function createDepartment(payload) {
  return axiosClient.post("/admin/departments", payload);
}

export function updateDepartment(departmentId, payload) {
  return axiosClient.patch(`/admin/departments/${departmentId}`, payload);
}

export function deleteDepartment(departmentId) {
  return axiosClient.delete(`/admin/departments/${departmentId}`);
}

// Archived projects
export function getArchivedProjects(params = {}) {
  return axiosClient.get("/admin/archive", { params });
}

export function getArchivedProject(archiveId) {
  return axiosClient.get(`/admin/archive/${archiveId}`);
}

export function createArchivedProject(payload) {
  return axiosClient.post("/admin/archive", payload);
}

export function updateArchivedProject(archiveId, payload) {
  return axiosClient.patch(`/admin/archive/${archiveId}`, payload);
}

export function deleteArchivedProject(archiveId) {
  return axiosClient.delete(`/admin/archive/${archiveId}`);
}