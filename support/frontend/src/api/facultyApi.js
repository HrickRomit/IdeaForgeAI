import axiosClient from "./axiosClient";

export async function getFacultyProfile() {
  const response = await axiosClient.get("/faculty/me");
  return response.data;
}

export async function getAssignedProposals(status) {
  const response = await axiosClient.get("/faculty/proposals", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function getReviewQueue() {
  const response = await axiosClient.get("/faculty/queue");
  return response.data;
}

export async function getFacultyProposal(proposalId) {
  const response = await axiosClient.get(`/faculty/proposals/${proposalId}`);
  return response.data;
}

export async function submitFacultyReview(proposalId, payload) {
  const response = await axiosClient.post(
    `/faculty/proposals/${proposalId}/reviews`,
    payload,
  );
  return response.data;
}

export async function getFacultyAnalytics() {
  const response = await axiosClient.get("/faculty/analytics");
  return response.data;
}