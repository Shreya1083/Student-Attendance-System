import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Bell, 
  PieChart, 
  Calendar, 
  LogOut, 
  KeyRound, 
  Clock, 
  Mail,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { ChangePasswordModal } from '../../components/ChangePasswordModal.jsx';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <Bell className="w-3.5 h-3.5" />
            <span>Student Academic Portal • Semester Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Student'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              {user?.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First Session'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur border border-white/10 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Role Verification & Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Authenticated Role</span>
            <Bell className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">{user?.role}</div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Strict Horizontal Data Isolation
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Formula</span>
            <PieChart className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">(P + L) / Total × 100</div>
          <p className="text-xs text-slate-500">Threshold warning trigger at &lt; 75%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In-App Notifications</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">Deduplicated Alerts</div>
          <p className="text-xs text-slate-500">Zero duplicate active unread warnings</p>
        </div>
      </div>

      {/* Student Modules Roadmap Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-600" />
          Student Attendance Modules & Analytics
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time student attendance monitoring modules:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <span className="font-semibold text-slate-800 text-sm block">1. Subject Attendance Cards</span>
            <p className="text-xs text-slate-500">Real-time percentage gauges with color indicators (Green/Amber/Red).</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <span className="font-semibold text-slate-800 text-sm block">2. Session History Timeline</span>
            <p className="text-xs text-slate-500">Date-wise logs of attended, absent, and late lectures.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <span className="font-semibold text-slate-800 text-sm block">3. Notification Center</span>
            <p className="text-xs text-slate-500">Deficiency alerts with read/unread tracking.</p>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
