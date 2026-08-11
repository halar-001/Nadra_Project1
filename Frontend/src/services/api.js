import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
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
  (response) => {
    if (localStorage.getItem("token")) {
      localStorage.setItem("last_api_activity", Date.now().toString());
    } else {
      sessionStorage.setItem("last_api_activity", Date.now().toString());
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // If token exists but server returns 401, token is expired or invalid
      if (token && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        console.warn("Session expired or token invalid. Status:", error.response.status);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("user_ai_prompt_count");
        localStorage.removeItem("user_ai_sql_count");
        localStorage.removeItem("last_api_activity");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("last_api_activity");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
