import axiosClient from "./axiosClient";

export function getFacultyProfile() {
  return axiosClient.get("/faculty/me");
}

export function getFacultyProposals() {
  return axiosClient.get("/faculty/proposals");
}

export function getFacultyProposal(proposalId) {
  return axiosClient.get(`/faculty/proposals/${proposalId}`);
}

export function reviewFacultyProposal(proposalId, payload) {
  return axiosClient.post(`/faculty/proposals/${proposalId}/reviews`, payload);
}
