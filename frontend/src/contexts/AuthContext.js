import React, { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        setError("Invalid token");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      setUser(jwt_decode(data.token));
      setError(null);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
