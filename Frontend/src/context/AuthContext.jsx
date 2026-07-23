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
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Verify stored profile on mount if token exists
  const verifySession = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      // Attempt real backend verification
      const profile = await authService.getProfile();
      if (profile && profile.user) {
        setUser(profile.user);
      }
    } catch (err) {
      // If token is invalid or expired, log out; if backend is unreachable, keep existing state for offline dev
      if (err.response && err.response.status === 401) {
        clearAuthData();
      }
    } finally {
      setIsLoading(false);
    }
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
      
      // Auto login after successful registration or return response
      const newUser = data.user || {
        id: Date.now(),
        fullName,
        email,
        role: "ROLE_VIEWER",
      };
      const jwtToken = data.token || "mock-jwt-token-registered";
      saveAuthData(newUser, jwtToken, true);
      return { success: true, user: newUser };
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
