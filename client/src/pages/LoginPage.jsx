import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  User,
  ArrowRight
} from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, user, getRoleDashboardPath, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // If already authenticated, redirect to role dashboard immediately
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname || getRoleDashboardPath(user.role);
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { user: loggedInUser } = await login(email.trim(), password);
      // Determine redirection: either original requested URL or role home
      const destination = location.state?.from?.pathname || getRoleDashboardPath(loggedInUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test credential autofill helper
  const handleQuickFill = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setValidationErrors({});
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to CampusTrack
          </h2>
          <p className="text-sm text-slate-500">
            Student Attendance and Notification Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold text-rose-800">Authentication Error</p>
                <p className="mt-0.5 text-xs sm:text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors({ ...validationErrors, email: null });
                  }}
                  placeholder="e.g. admin@attendance.edu"
                  className={`block w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                    validationErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1.5 text-xs text-rose-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors({ ...validationErrors, password: null });
                  }}
                  placeholder="Enter your password"
                  className={`block w-full pl-11 pr-11 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                    validationErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white bg-brand-600 hover:bg-brand-700 font-semibold text-sm shadow-md shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>

          {/* Quick Demo Credentials Widget */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-center">
              Quick Role Login (Demo Accounts)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@attendance.edu', 'Admin@123456')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-brand-700 text-xs font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('faculty@attendance.edu', 'Faculty@123456')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student@attendance.edu', 'Student@123456')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 text-slate-700 hover:text-amber-700 text-xs font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
