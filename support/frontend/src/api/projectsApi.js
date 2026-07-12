import axiosClient from "./axiosClient";

export async function searchArchivedProjects({ query, filters = {}, topK = 6 }) {
  const response = await axiosClient.get("/projects/search", {
    params: {
      q: query,
      top_k: topK,
      department: filters.department || undefined,
      year: filters.year || undefined,
      difficulty: filters.difficulty || undefined,
    },
  });

  return response.data;
}
