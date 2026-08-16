import axiosClient from "./axiosClient";

export async function getAllArchivedProjects(filters = {}) {
  const response = await axiosClient.get("/projects", {
    params: {
      department: filters.department || undefined,
      year: filters.year || undefined,
      difficulty: filters.difficulty || undefined,
    },
  });
  return response.data;
}

export async function getArchivedProjectById(projectId) {
  const response = await axiosClient.get(`/projects/${encodeURIComponent(projectId)}`);
  return response.data;
}

export async function searchArchivedProjects({ query, filters = {}, topK = 6 }) {
  const response = await axiosClient.get("/projects/search", {
    params: {
      q: query,
      top_k: topK,
      department: filters.department || undefined,
      year: filters.year || undefined,
      semester: filters.semester || undefined,
    },
  });

  return response.data;
}

