import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const UnauthorizedPage = () => {
  const { user, getRoleDashboardPath } = useAuth();
  const location = useLocation();
  const requiredRoles = location.state?.requiredRoles || [];
  const currentRole = location.state?.currentRole || user?.role || 'None';

  const userDashboard = user ? getRoleDashboardPath(user.role) : '/login';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200/80 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">403 - Access Forbidden</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You do not have permission to access this resource. Your current authenticated role is{' '}
            <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs">
              {currentRole}
            </span>
            {requiredRoles.length > 0 && (
              <span className="block mt-1 text-xs text-slate-500">
                Required role(s): {requiredRoles.join(', ')}
              </span>
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={userDashboard}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
