import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest = null;

function clearAuthentication() {
  localStorage.removeItem("ideaforge_access_token");
  localStorage.removeItem("ideaforge_refresh_token");
  localStorage.removeItem("ideaforge_user_role");
  localStorage.removeItem("ideaforge_user_name");
  localStorage.removeItem("ideaforge_user_email");
  localStorage.removeItem("ideaforge_student_id");
  localStorage.removeItem("ideaforge_department_code");
  localStorage.removeItem("ideaforge_department_id");
}

axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("ideaforge_access_token");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("ideaforge_refresh_token");

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");

    if (
      !isUnauthorized ||
      !refreshToken ||
      originalRequest?._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
      }

      const refreshResponse = await refreshRequest;
      const newAccessToken = refreshResponse.data.access_token;
      const newRefreshToken = refreshResponse.data.refresh_token;

      localStorage.setItem("ideaforge_access_token", newAccessToken);
      localStorage.setItem("ideaforge_refresh_token", newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosClient(originalRequest);
    } catch (refreshError) {
            const previousRole = localStorage.getItem("ideaforge_user_role");
      clearAuthentication();

      const destination = previousRole === "admin" ? "/admin" : "/login";

      if (!window.location.pathname.startsWith(destination)) {
        window.location.assign(destination);
      }
      }

      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  },
);

export default axiosClient;
