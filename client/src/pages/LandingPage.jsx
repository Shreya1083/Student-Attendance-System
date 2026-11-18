import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  CheckCircle2,
  Shield, 
  Users, 
  BookOpen, 
  Bell, 
  Calendar,
  Lock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  BarChart3,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { APP_CONFIG, DEFAULT_ATTENDANCE_THRESHOLD } from '../utils/constants.js';

export const LandingPage = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
          <GraduationCap className="w-4 h-4 text-brand-600" />
          <span>Academic Portal • Academic Year 2026-2027</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Student Attendance & <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800">
            Notification System
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          A secure, centralized academic management platform engineered to eliminate duplicate attendance records, compute real-time attendance analytics, and deliver proactive low-attendance warnings.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
          >
            <span>Access Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-colors shadow-sm"
          >
            <span>Explore Modules</span>
          </a>
        </div>
      </section>

      {/* Key Institutional Standards & Operational Highlights */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              Academic Attendance Framework & Key Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated rules and institutional standards enforced across all academic cohorts
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Active Semester Operations
          </span>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Quota</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{DEFAULT_ATTENDANCE_THRESHOLD}% Minimum</div>
            <p className="text-xs text-slate-500">Statutory requirement for exam and term grant eligibility</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-600">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Marking Engine</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">Tri-State Logging</div>
            <p className="text-xs text-slate-500">Records PRESENT, ABSENT, and LATE status accurately</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-600">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Alert Engine</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">Automated Alerts</div>
            <p className="text-xs text-slate-500">Instant in-app notifications when attendance drops below quota</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center space-x-2 text-blue-600">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Integrity</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">Zero Duplication</div>
            <p className="text-xs text-slate-500">Compound unique constraints and immutable modification logs</p>
          </div>
        </div>
      </section>

      {/* Architecture & Role Portals Preview */}
      <section id="features" className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900">Role-Based Academic Portals</h3>
          <p className="text-slate-500 text-sm mt-1">
            Engineered with strict Role-Based Access Control (RBAC) and complete departmental data isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Role */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Admin Portal</h4>
              <p className="text-slate-500 text-xs mt-1">Master Data & Academic Governance</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 flex-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span>Student & Faculty Account Management</span>
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
                <span>Global Low-Attendance Warning Threshold ({DEFAULT_ATTENDANCE_THRESHOLD}%)</span>
              </li>
            </ul>
            <div className="pt-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Sign in as Administrator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Faculty Role */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Faculty Portal</h4>
              <p className="text-slate-500 text-xs mt-1">Class Attendance & Session Auditing</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 flex-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Assigned Teaching Courses & Cohorts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Tri-State Marking: PRESENT, ABSENT, LATE</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Duplicate Session Prevention & Validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Full Audit History on Modified Records</span>
              </li>
            </ul>
            <div className="pt-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Sign in as Faculty <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Student Role */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Student Portal</h4>
              <p className="text-slate-500 text-xs mt-1">Attendance Dashboard & Warning Alerts</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 flex-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Subject-wise Attendance Statistics</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Color-Coded Status Gauges (Safe / Warning / Critical)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Proactive Low-Attendance Notification Center</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Strict Horizontal Student Privacy Isolation</span>
              </li>
            </ul>
            <div className="pt-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                Sign in as Student <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Policies & System Architecture Card */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-lg">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider block">
            Academic Operations & Institutional Policies
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
