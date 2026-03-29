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
    const decoded = jwtDecode(token);
    // 🛡️ Map backend 'sub' to frontend 'username' for consistency
    if (decoded && decoded.sub && !decoded.username) {
      decoded.username = decoded.sub;
    }
    return decoded;
  } catch (err) {
    console.error("JWT Decode Error:", err);
    return null;
  }
}

// -----------------------------
// MAIN PROVIDER
// -----------------------------
export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(() => localStorage.getItem("ceph_token"));
  const [currentUser, setCurrentUser] = useState(null);

  // 🔥 NEW PROFILE STATE
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================================================
  // 🔥 FETCH PROFILE
  // ======================================================
  const fetchProfile = useCallback(async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setProfile(data);

    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("ceph_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const decoded = safeDecode(storedToken);
      if (!decoded) {
        setLoading(false);
        return;
      }

      if (!decoded) {
        localStorage.removeItem("ceph_token");
        setCurrentUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setCurrentUser(decoded);

      // 🔥 FETCH PROFILE HERE
      await fetchProfile(storedToken);

      setLoading(false);
    };

    init();
  }, [fetchProfile]);

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

      // 🔥 SAVE TOKEN
      localStorage.setItem("ceph_token", data.access_token);
      setToken(data.access_token);

      const decoded = safeDecode(data.access_token);
      setCurrentUser(decoded);

      // 🔥 FETCH PROFILE AFTER LOGIN
      await fetchProfile(data.access_token);

      setLoading(false);
      return true;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [fetchProfile]);

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
    setProfile(null);
  }, []);

  // ======================================================
  // GET AUTH HEADERS
  // ======================================================
  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // ======================================================
  // AUTO LOGOUT
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
  // UNREAD COUNT POLLING
  // ======================================================
  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/chat/unread-total`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // 1 minute to save on hosting costs
    return () => clearInterval(interval);
  }, [token]);

  // ======================================================
  // DEBUG
  // ======================================================
  useEffect(() => {
    console.log("USER:", currentUser);
    console.log("PROFILE:", profile);
  }, [currentUser, profile]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        unreadCount,
        setUnreadCount,
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