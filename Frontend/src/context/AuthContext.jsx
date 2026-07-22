import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  const login = async (email, password) => {
    // Mock login for Day 2 until API integration
    const mockUser = {
      id: 1,
      username: email.split("@")[0] || "Developer",
      email,
      role: "ADMIN",
    };
    const mockToken = "mock-jwt-token-12345";

    setUser(mockUser);
    setToken(mockToken);
    return { success: true, user: mockUser };
  };

  const register = async (username, email, password) => {
    const mockUser = {
      id: Date.now(),
      username,
      email,
      role: "DEVELOPER",
    };
    const mockToken = "mock-jwt-token-67890";

    setUser(mockUser);
    setToken(mockToken);
    return { success: true, user: mockUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
