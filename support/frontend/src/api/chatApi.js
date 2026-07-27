import axiosClient from "./axiosClient";

export function sendChatMessage(payload) {
  return axiosClient.post("/chat/message", payload);
}
