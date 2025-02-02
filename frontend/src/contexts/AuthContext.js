import React, { createContext, useState, useEffect, useCallback } from "react";
import jwt_decode from "jwt-decode";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwt_decode(token);
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            await logout();
          } else {
            setAuthToken(token);
            setUser(decoded);
            setIsAuthenticated(true);
            // Fetch additional user data
            await fetchUserData(token);
          }
        } catch (error) {
          console.error("Token validation error:", error);
          await logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Fetch additional user data
  const fetchUserData = async (token) => {
    try {
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setUser((prevUser) => ({
        ...prevUser,
        ...userData,
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data");
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      const decoded = jwt_decode(data.token);
      setUser(decoded);
      setIsAuthenticated(true);
      await fetchUserData(data.token);

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      const decoded = jwt_decode(data.token);
      setUser(decoded);
      setIsAuthenticated(true);
      await fetchUserData(data.token);

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Optional: Call logout endpoint if you need to invalidate token on server
      if (authToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, [authToken]);

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      setUser((prevUser) => ({
        ...prevUser,
        ...data,
      }));

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Password reset request
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset request failed");
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Verify auth token
  const verifyToken = useCallback(async () => {
    if (!authToken) return false;

    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }, [authToken]);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    authToken,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    verifyToken,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
