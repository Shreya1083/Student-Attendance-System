import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  User, 
  LogOut, 
  LogIn, 
  LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { APP_CONFIG } from '../utils/constants.js';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getRoleDashboardPath } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />;
      case 'FACULTY':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'STUDENT':
        return <User className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FACULTY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'STUDENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">
                EduAttendance
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                SPM Micro-Project
              </span>
            </div>
          </Link>

          {/* Right Navigation Controls */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* User Role Badge */}
                <div className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  <span>{user.role}</span>
                </div>

                {/* Dashboard Link */}
                <Link
                  to={getRoleDashboardPath(user.role)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" />
                  <span>Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs sm:text-sm font-medium transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Phase 2 Verified
                </span>
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
