import api from "./api";

/**
 * Authentication Service handling API calls for register, login, profile, and logout.
 */
export const authService = {
  /**
   * Register a new user (defaults to ROLE_VIEWER on backend).
   * @param {Object} data - { fullName, email, password }
   */
  async register(data) {
    const response = await api.post("/auth/register", {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Login user and obtain JWT token + User info.
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await api.post("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile.
   */
  async getProfile() {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  /**
   * Logout user session on backend.
   */
  async logout() {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch {
      // Ignore network failure on logout
      return { success: true };
    }
  },
};

export default authService;
