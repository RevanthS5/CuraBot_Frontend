import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'patient' | 'doctor' | 'admin' | 'any';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'any' && user?.role !== role) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return <>{children}</>;
}