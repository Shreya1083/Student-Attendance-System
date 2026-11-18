import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Helper to determine home dashboard based on role
  const getRoleDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'FACULTY':
        return '/faculty/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  // Restore authenticated session from token on page load/refresh
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data);
      setToken(savedToken);
      setAuthError(null);
    } catch (err) {
      // Token is invalid, expired, or user deactivated
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setAuthError(err.message || 'Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token: jwtToken } = res.data;

      localStorage.setItem('token', jwtToken);
      setUser(userData);
      setToken(jwtToken);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.message || 'Invalid email or password';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Student registration handler
  const register = async (studentData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', studentData);
      const { user: userData, token: jwtToken } = res.data;

      localStorage.setItem('token', jwtToken);
      setUser(userData);
      setToken(jwtToken);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with client cleanup even if network fails
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setAuthError(null);
    }
  };

  // Change password handler
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }

      return { success: true, message: res.message || 'Password changed successfully' };
    } catch (err) {
      throw new Error(err.message || 'Failed to change password');
    }
  };

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
    checkAuth,
    getRoleDashboardPath
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
