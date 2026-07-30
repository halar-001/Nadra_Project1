import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token from localStorage or sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global 401 Unauthorized & 403 Forbidden Responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // If token exists but server returns 401/403, token is expired or invalid
      if (token && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        console.warn("Session expired or token invalid. Status:", error.response.status);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
