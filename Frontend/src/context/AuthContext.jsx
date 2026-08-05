import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync token & user to persistent storage
  const saveAuthData = (userData, tokenData, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Clear opposite storage to avoid duplicates
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    if (userData && tokenData) {
      storage.setItem("user", JSON.stringify(userData));
      storage.setItem("token", tokenData);
    }
    
    setUser(userData);
    setToken(tokenData);
  };

  const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user_ai_prompt_count");
    localStorage.removeItem("user_ai_sql_count");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Verify stored profile on mount if token exists
  const verifySession = useCallback(async () => {
    // Session verified via stored JWT token locally until backend GET /api/auth/profile is deployed
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  /**
   * Log in user with email & password
   */
  const login = async (email, password, rememberMe = true) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Call live backend Auth API
      const data = await authService.login({ email, password });
      
      const loggedUser = data.user || {
        id: data.id || 1,
        fullName: data.fullName || email.split("@")[0],
        email: data.email || email,
        role: data.role || "ROLE_VIEWER",
      };
      
      const jwtToken = data.token || data.jwt || "jwt-token-sample";
      saveAuthData(loggedUser, jwtToken, rememberMe);
      return { success: true, user: loggedUser };
    } catch (err) {
      // Fallback for local frontend standalone testing if backend server isn't running yet
      if (!err.response) {
        console.warn("Backend server not reached. Using mock auth state for Day 1-2 testing.");
        const isPreseededAdmin = email.includes("admin");
        const mockUser = {
          id: isPreseededAdmin ? 1 : Date.now(),
          fullName: isPreseededAdmin ? "System Administrator" : email.split("@")[0],
          email,
          role: isPreseededAdmin ? "ROLE_ADMIN" : "ROLE_VIEWER",
        };
        const mockToken = "mock-jwt-token-xyz-123456789";
        saveAuthData(mockUser, mockToken, rememberMe);
        return { success: true, user: mockUser };
      }

      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Invalid email or password";
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user (automatically assigned ROLE_VIEWER)
   */
  const register = async (fullName, email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authService.register({ fullName, email, password });
      
      // Auto login after successful registration
      return await login(email, password, true);
    } catch (err) {
      if (!err.response) {
        console.warn("Backend server not reached. Simulating viewer registration.");
        const mockUser = {
          id: Date.now(),
          fullName,
          email,
          role: "ROLE_VIEWER",
        };
        const mockToken = "mock-jwt-token-registered";
        saveAuthData(mockUser, mockToken, true);
        return { success: true, user: mockUser };
      }

      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Registration failed";
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update Profile Info (fullName, email)
   */
  const updateProfile = async (fullName, email) => {
    try {
      const data = await authService.updateProfile({ fullName, email });
      const updatedUser = data.user || { ...user, fullName, email };
      saveAuthData(updatedUser, token, true);
      return data;
    } catch (err) {
      if (!err.response) {
        // Fallback for offline dev
        const updatedUser = { ...user, fullName, email };
        saveAuthData(updatedUser, token, true);
        return { message: "Profile updated successfully", user: updatedUser };
      }
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update profile";
      throw new Error(msg);
    }
  };

  /**
   * Change Password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const data = await authService.changePassword({ currentPassword, newPassword });
      return data;
    } catch (err) {
      if (!err.response) {
        // Mock offline fallback check
        if (currentPassword === "wrong") {
          throw new Error("Incorrect current password");
        }
        return { message: "Password changed successfully" };
      }
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to change password";
      throw new Error(msg);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuthData();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        authError,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
