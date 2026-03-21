// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// -----------------------------
// Safe JWT Decode
// -----------------------------
function safeDecode(token) {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("JWT Decode Error:", err);
    return null;
  }
}

// -----------------------------
// MAIN PROVIDER
// -----------------------------
export const AuthProvider = ({ children }) => {

  // 🔥 START AS undefined (IMPORTANT FIX)
  const [token, setToken] = useState(() => localStorage.getItem("ceph_token"));
  const [currentUser, setCurrentUser] = useState(undefined);

  const [loading, setLoading] = useState(true); // 🔥 start true
  const [error, setError] = useState(null);

  // ======================================================
  // INITIAL LOAD (CRITICAL FIX)
  // ======================================================
  useEffect(() => {
    const storedToken = localStorage.getItem("ceph_token");

    if (!storedToken) {
      setCurrentUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    const decoded = safeDecode(storedToken);

    if (!decoded) {
      localStorage.removeItem("ceph_token");
      setCurrentUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setCurrentUser(decoded);
    setLoading(false);
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);

      const res = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();

      // 🔥 Save token
      localStorage.setItem("ceph_token", data.access_token);
      setToken(data.access_token);

      const decoded = safeDecode(data.access_token);
      setCurrentUser(decoded);

      setLoading(false);
      return true;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, []);

  // ======================================================
  // REGISTER
  // ======================================================
  const registerUser = async (username, password, role) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Register failed" }));
        throw new Error(err.detail || "Registration failed");
      }

      const ok = await login(username, password);
      return ok;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================
  const logout = useCallback(() => {
    localStorage.removeItem("ceph_token");
    setToken(null);
    setCurrentUser(null);
  }, []);

  // ======================================================
  // GET AUTH HEADERS
  // ======================================================
  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // ======================================================
  // AUTO LOGOUT (Safe Version)
  // ======================================================
  useEffect(() => {
    if (!currentUser?.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const ttl = currentUser.exp - now;

    if (ttl <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, ttl * 1000);

    return () => clearTimeout(timer);
  }, [currentUser, logout]);

  // ======================================================
  // DEBUG
  // ======================================================
  useEffect(() => {
    console.log("CURRENT USER:", currentUser);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        error,
        login,
        logout,
        registerUser,
        getAuthHeaders,
        isAdmin: () => currentUser?.role === "admin",
        isDoctor: () => currentUser?.role === "doctor",
        isAuthenticated: () => !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};