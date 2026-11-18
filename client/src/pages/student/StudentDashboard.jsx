import React, { useState, useEffect, useCallback } from 'react';
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
  ShieldCheck,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api.js';
import { ChangePasswordModal } from '../../components/ChangePasswordModal.jsx';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Real backend data states
  const [attendanceData, setAttendanceData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // History modal state
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectHistory, setSubjectHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [attRes, notifRes] = await Promise.all([
        api.get('/student/my-attendance'),
        api.get('/student/notifications')
      ]);

      setAttendanceData(attRes.data);
      setNotifications(notifRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Mark single notification as read
  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/student/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/student/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // View subject history
  const handleViewSubjectHistory = async (sub) => {
    setSelectedSubject(sub);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/student/my-attendance/${sub.subjectId}`);
      setSubjectHistory(res.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const student = attendanceData?.student;
  const overall = attendanceData?.overall;
  const threshold = attendanceData?.threshold || 75;
  const subjects = attendanceData?.subjects || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            Welcome, {student?.name || user?.name || 'Student'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              USN: {student?.rollNumber || 'Loading...'}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              {student ? `${student.department} • Semester ${student.semester}-${student.section}` : 'Cohort'}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              {user?.email}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur border border-white/10 transition-colors"
            title="Refresh attendance records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
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

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-semibold">Unable to load student data</p>
            <p className="text-xs sm:text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Low Attendance Warning Alert Banner */}
      {overall && overall.isShortage && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-900">Attendance Shortage Alert</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Your cumulative attendance is {overall.percentage}%, which is below the mandatory {threshold}% institutional cutoff. Please attend upcoming lectures to regain exam eligibility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Verification & Cumulative Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cumulative Attendance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Attendance</span>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex items-baseline space-x-3">
            <span className={`text-3xl font-extrabold font-mono ${overall && overall.percentage < threshold ? 'text-rose-600' : 'text-emerald-600'}`}>
              {loading ? '--' : `${overall?.percentage ?? 100}%`}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Target: {threshold}%
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {overall ? `${overall.totalAttended} of ${overall.totalConducted} total sessions attended` : 'Loading...'}
          </p>
        </div>

        {/* Registered Cohort */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Cohort</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {student ? `${student.department} Sem-${student.semester}` : '--'}
          </div>
          <p className="text-xs text-slate-500">
            Section: <span className="font-bold text-slate-800">{student?.section || '-'}</span> • {subjects.length} Enrolled Courses
          </p>
        </div>

        {/* In-App Alerts Counter */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Notifications</span>
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {unreadCount} Unread
            </span>
            <span className="text-xs text-slate-400">({notifications.length} Total)</span>
          </div>
          <p className="text-xs text-slate-500">Automated early warning notification engine</p>
        </div>
      </div>

      {/* Notifications Drawer / Panel */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Institutional Notification Inbox
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`py-3 flex items-start justify-between gap-4 text-xs ${!notif.isRead ? 'bg-amber-50/40 -mx-2 px-2 rounded-lg' : ''}`}
              >
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${notif.isRead ? 'text-slate-400' : 'text-amber-600'}`} />
                  <div>
                    <p className={`font-medium ${notif.isRead ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject-wise Attendance Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Subject-wise Attendance Performance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time calculations based on conducted lectures and verified student logs
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-xs font-semibold">Calculating attendance statistics...</p>
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub) => {
              const isBelow = sub.totalSessions > 0 && sub.attendancePercentage < threshold;
              const hasNoData = sub.totalSessions === 0;

              return (
                <div
                  key={sub.subjectId}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-50 text-brand-700 border border-indigo-100">
                        {sub.subjectCode}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          hasNoData
                            ? 'bg-slate-50 text-slate-600 border-slate-200'
                            : isBelow
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {hasNoData ? 'No Sessions' : isBelow ? 'Shortage Warning' : 'Safe Attendance'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {sub.subjectName}
                    </h3>
                    <p className="text-xs text-slate-400">Credits: {sub.credits}</p>
                  </div>

                  {/* Percentage & Progress Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-slate-500">Attendance:</span>
                      <span
                        className={`text-2xl font-extrabold font-mono ${
                          hasNoData ? 'text-slate-400' : isBelow ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {hasNoData ? '--' : `${sub.attendancePercentage}%`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          hasNoData ? 'bg-slate-300' : isBelow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(sub.attendancePercentage, 100)}%` }}
                      />
                    </div>

                    {/* Detailed Counts */}
                    <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-center text-slate-500">
                      <div className="bg-slate-50 rounded-lg py-1">
                        <span className="block font-bold text-slate-800 font-mono">{sub.presentCount}</span>
                        <span>Present</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-1">
                        <span className="block font-bold text-slate-800 font-mono">{sub.lateCount}</span>
                        <span>Late (100%)</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-1">
                        <span className="block font-bold text-slate-800 font-mono">{sub.absentCount}</span>
                        <span>Absent</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Total Sessions: {sub.totalSessions}</span>
                      <button
                        onClick={() => handleViewSubjectHistory(sub)}
                        className="text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No subjects assigned to your cohort yet.
          </div>
        )}
      </div>

      {/* Session History Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-600" />
                  Attendance Log: {selectedSubject.subjectName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Code: {selectedSubject.subjectCode} • Total Conducted: {subjectHistory?.totalSessions || 0}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-3">
              {historyLoading ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                </div>
              ) : subjectHistory?.history?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {subjectHistory.history.map((h, i) => (
                    <div key={h.sessionId || i} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">
                            {new Date(h.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {h.sessionSlot}
                          </span>
                        </div>
                        {h.topic && <p className="text-slate-500 italic">Topic: {h.topic}</p>}
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          h.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : h.status === 'LATE'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-xs text-slate-400">
                  No lecture sessions conducted for this subject yet.
                </p>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
