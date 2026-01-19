import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta

const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.token) {
    return <Navigate to="/" replace />; // Redirige a la ruta raíz (Login)
  }

  return <Outlet />; // Renderiza las rutas anidadas si el usuario está autenticado
};

export default ProtectedRoute;