import React from 'react';
import { 
  CheckCircle, 
  Activity, 
  Shield, 
  Users, 
  BookOpen, 
  Bell, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Database, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck.js';
import { APP_CONFIG, DEFAULT_ATTENDANCE_THRESHOLD } from '../utils/constants.js';

export const LandingPage = () => {
  const { health, loading, error, refetch } = useHealthCheck();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>System Initialization Complete • Phase 1 Verified</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Student Attendance & <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800">
            Notification System
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          A secure, role-based platform designed for academic institutions to eliminate duplicate attendance records, dynamically compute percentages, and provide automated low-attendance warnings.
        </p>
      </section>

      {/* Real-time Backend Health Probe */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-brand-600" />
                Backend API Health Probe
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live status ping to <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-brand-600">GET /api/v1/health</code>
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Checking...' : 'Re-check Connection'}</span>
          </button>
        </div>

        {/* Health Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">API Service</span>
            <div className="mt-2 flex items-center space-x-2">
              {error ? (
                <span className="inline-flex items-center text-rose-600 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Offline
                </span>
              ) : health ? (
                <span className="inline-flex items-center text-emerald-600 font-bold text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" /> Operational
                </span>
              ) : (
                <span className="text-slate-400 text-sm">Connecting...</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Database (MongoDB)</span>
            <div className="mt-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-slate-500" />
              <span className={`text-sm font-bold capitalize ${health?.database?.status === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {health?.database?.status || 'Standby'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Server Uptime</span>
            <div className="mt-2 text-sm font-bold text-slate-800">
              {health?.uptime?.formatted || 'Just started'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Environment</span>
            <div className="mt-2 text-sm font-bold text-slate-800 uppercase font-mono">
              {health?.environment || 'Development'}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to connect to backend server:</p>
              <p className="mt-0.5 text-rose-600">{error}. Ensure the Express backend is running on port 5000.</p>
            </div>
          </div>
        )}
      </section>

      {/* Architecture & Role Portals Preview */}
      <section className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900">Three-Tier Role Architecture</h3>
          <p className="text-slate-500 text-sm mt-1">
            Engineered with strict Role-Based Access Control (RBAC) and horizontal data isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Role */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Admin Portal</h4>
              <p className="text-slate-500 text-xs mt-1">Master Data & Institutional Oversight</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span>Create Student & Faculty Accounts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span>Departments, Semesters, Sections & Subjects</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span>Faculty-to-Subject Assignment Matrix</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span>Global Low-Attendance Threshold ({DEFAULT_ATTENDANCE_THRESHOLD}%)</span>
              </li>
            </ul>
          </div>

          {/* Faculty Role */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Faculty Portal</h4>
              <p className="text-slate-500 text-xs mt-1">Class Attendance & Audit History</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>View Assigned Subjects & Cohorts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Tri-State Marking: PRESENT, ABSENT, LATE</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Zero Duplicate Session Enforcement</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Full Audit Trail on Record Revisions</span>
              </li>
            </ul>
          </div>

          {/* Student Role */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Student Portal</h4>
              <p className="text-slate-500 text-xs mt-1">Self-Service Dashboard & In-App Alerts</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Subject-wise Attendance Percentages</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Color-Coded Status (Green / Amber / Red)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Deduplicated Low-Attendance Notifications</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Strict Horizontal Data Isolation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Finalized System Constraints Card */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-6">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider block">
            Approved SPM Specifications
          </span>
          <h3 className="text-2xl font-bold mt-1">Core Integrity & Calculation Rules</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-brand-200 block text-sm">Tri-State Attendance</span>
            <p className="text-slate-300">
              PRESENT, ABSENT, and LATE. LATE gives 100% attendance credit while maintaining separate logs.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-brand-200 block text-sm">Cohort Enrollment</span>
            <p className="text-slate-300">
              Department, Semester & Section-based. Students in a cohort automatically enroll in cohort subjects.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-brand-200 block text-sm">Duplicate Prevention</span>
            <p className="text-slate-300">
              Compound unique indexes on Session (6 fields) and Record (sessionId + studentId).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-brand-200 block text-sm">Audit & Deduplication</span>
            <p className="text-slate-300">
              Immutable logs for edits. In-app alerts deduplicated to prevent spamming active unread warnings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
