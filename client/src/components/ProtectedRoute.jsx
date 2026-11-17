import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Verifying session credentials...</p>
      </div>
    );
  }

  // Unauthenticated user -> redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: If user role is not permitted for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace state={{ requiredRoles: allowedRoles, currentRole: user.role }} />;
  }

  return children ? children : <Outlet />;
};
