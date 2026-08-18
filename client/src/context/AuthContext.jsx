/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import { BASE_URL } from "../config";

const API_URL = `${BASE_URL}/auth`;

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      return storedUser && token ? storedUser : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { user: data.user };
    } catch (err) {
      console.error("Login error:", err);
      return { error: "Server not reachable" };
    }
  };

  // 📝 SIGNUP — accepts full form data object
  const signup = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { user: data.user };
    } catch (err) {
      console.error("Signup error:", err);
      return { error: "Server not reachable" };
    }
  };

  // OTP helpers
  const sendEmailOtp = async (email, role) => {
    try {
      const res = await fetch(`${API_URL}/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { success: true, message: data.message };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    try {
      const res = await fetch(`${API_URL}/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { verified: true };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  const sendPhoneOtp = async (phone) => {
    try {
      const res = await fetch(`${API_URL}/send-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { success: true, message: data.message };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  const verifyPhoneOtp = async (phone, otp) => {
    try {
      const res = await fetch(`${API_URL}/verify-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { verified: true };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  const sendForgotPasswordOtp = async (email) => {
    try {
      const res = await fetch(`${API_URL}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { success: true, message: data.message };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  const resetForgotPassword = async (email, otp, newPassword, confirmPassword) => {
    try {
      const res = await fetch(`${API_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { success: true, message: data.message };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  const verifyForgotPasswordOtp = async (email, otp) => {
    try {
      const res = await fetch(`${API_URL}/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message };
      return { verified: true, message: data.message };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  // � UPDATE USER
  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // �🚪 LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        sendEmailOtp,
        verifyEmailOtp,
        sendPhoneOtp,
        verifyPhoneOtp,
        sendForgotPasswordOtp,
        resetForgotPassword,
        verifyForgotPasswordOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
