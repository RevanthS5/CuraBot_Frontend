import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'patient' | 'doctor' | 'admin' | 'any';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'any' && user?.role !== role) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return <>{children}</>;
}