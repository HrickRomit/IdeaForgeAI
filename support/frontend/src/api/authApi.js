import axiosClient from "./axiosClient";

export function registerUser(payload) {
  return axiosClient.post("/auth/register", payload);
}

export function loginUser(payload) {
  return axiosClient.post("/auth/login", payload);
}
export function loginAdmin(payload) {
  return axiosClient.post("/auth/admin/login", payload);
}

export function refreshAccessToken(refreshToken) {
  return axiosClient.post("/auth/refresh", {
    refresh_token: refreshToken,
  });
}

export function getCurrentUser() {
  return axiosClient.get("/auth/me");
}