// src/context/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Adjust the import based on your AuthProvider's location

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);

  // Retourne un indicateur de chargement tant que l'authentification n'est pas vérifiée
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // ou tout autre indicateur de chargement
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;