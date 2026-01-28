import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;

// Endpoints that should NOT trigger token refresh (to prevent infinite loops)
const noRefreshEndpoints = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/me"];

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this endpoint should skip refresh logic
    const shouldSkipRefresh = noRefreshEndpoints.some(
      (endpoint) => originalRequest.url?.startsWith(endpoint)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Prevent redirect loop if already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
