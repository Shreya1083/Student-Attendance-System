import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  BookOpen, 
  Calendar, 
  History, 
  LogOut, 
  KeyRound, 
  Clock, 
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api.js';
import { ChangePasswordModal } from '../../components/ChangePasswordModal.jsx';

export const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [assignedData, setAssignedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMySubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/faculty/my-subjects');
      setAssignedData(res.data);
    } catch (err) {
      setError(err.message || 'Unable to load assigned courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubjects();
  }, []);

  const assignments = assignedData?.assignments || [];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Portal • Phase 3 Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Faculty Member'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-300" />
              {user?.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active Session'}
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

      {/* Role Verification & Constraints Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Authenticated Staff</span>
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {assignedData?.faculty?.facultyCode || user?.role}
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Department: {assignedData?.faculty?.department || 'CSE'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Courses</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {assignments.length} Course(s)
          </div>
          <p className="text-xs text-slate-500">Authorized for attendance logging in Phase 4</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Marking Engine</span>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">Phase 4 Ready</div>
          <p className="text-xs text-slate-500">Zero duplicate session conflict checking</p>
        </div>
      </div>

      {/* Assigned Subjects Section (from GET /api/v1/faculty/my-subjects) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            My Assigned Teaching Subjects & Sections
          </h2>
          <span className="text-xs text-slate-400">Resolved via authenticated identity</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {assignments.map((as) => (
              <div
                key={as._id}
                className="p-5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 text-base font-mono">
                    {as.subjectId?.subjectCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    {as.subjectId?.credits} Credits
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug">
                    {as.subjectId?.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Cohort: {as.department} • Sem {as.semester} - Section {as.section}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Year: {as.academicYear}</span>
                  <Link
                    to={`/faculty/attendance?assignmentId=${as._id}`}
                    className="text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Mark Attendance <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No courses assigned yet</p>
            <p className="text-xs">Your academic administrator will assign courses to your faculty code ({assignedData?.faculty?.facultyCode || 'FACULTY'}).</p>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
