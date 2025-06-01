import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";
import apiClient from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`; 
      } catch (error) {
        console.error("Erro ao parsear usuário do localStorage", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("authToken", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${userToken}`;
        return response;
      }
    } catch (error) {
      console.error("Erro no login (AuthContext):", error);
      logout(); 
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      if (response.success && response.data) {
        const { user: newUserData, token: newUserToken } = response.data;
        setUser(newUserData);
        setToken(newUserToken);
        localStorage.setItem("authToken", newUserToken);
        localStorage.setItem("user", JSON.stringify(newUserData));
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newUserToken}`;
        return response;
      }
    } catch (error) {
      console.error("Erro no signup (AuthContext):", error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    delete apiClient.defaults.headers.common["Authorization"];
  };
  const value = {
    user,
    setUser, 
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};