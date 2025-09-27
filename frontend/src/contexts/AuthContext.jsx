import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { authAPI } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);

        // ✅ SIMPLIFICAR: La migración del carrito se manejará en otro lugar
        console.log("✅ Usuario autenticado:", response.data.email);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      setUser(user);
      localStorage.setItem("token", token);

      // ✅ SIMPLIFICAR: La migración se manejará en el CartProvider
      console.log("✅ Login exitoso, usuario:", user.email);

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error de conexión" };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      setUser(user);
      localStorage.setItem("token", token);

      // ✅ SIMPLIFICAR: La migración se manejará en el CartProvider
      console.log("✅ Registro exitoso, usuario:", user.email);

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error de conexión" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    authAPI.logout();
    console.log("✅ Logout exitoso");
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
