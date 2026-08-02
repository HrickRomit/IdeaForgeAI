import axiosClient from "./axiosClient";

export function submitProposal(payload) {
  return axiosClient.post("/proposals", payload);
}

export function getMyProposals() {
  return axiosClient.get("/proposals/mine");
}

export function uploadProposalDocument(proposalId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post(
    `/proposals/${proposalId}/document`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}