// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Vérifie si le token permet d'accéder à l'API
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const response = await axiosInstance.get('/auth/checkAuth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRole(response.data.user.role);
      setUserId(response.data.user.userId);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Ajoute une méthode login
  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { token } = response.data;

      localStorage.setItem('token', token);
      await checkAuth(); // ← Met à jour les infos directement
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur lors de la connexion' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRole(null);
    setUserId(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        role,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
