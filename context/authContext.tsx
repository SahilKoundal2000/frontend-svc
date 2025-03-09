"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import * as authApi from "../api/auth";

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: Record<string, string>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [username, setUsername] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("username") : null
  );
  const [role, setRole] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("role") : null
  );

  const handleLogin = async (identifier: string, password: string) => {
    const data = await authApi.login(identifier, password);
    if (data.success) {
      setToken(data.token);
      setUsername(data.username);
      setRole(data.role);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
    } else {
      throw new Error(data.error || "Login failed");
    }
  };

  const handleRegister = async (userData: Record<string, string>) => {
    const data = await authApi.register(userData);
    if (!data.success) {
      throw new Error(data.error || "Registration failed");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        role,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
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
