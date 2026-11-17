import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Building2, 
  BookOpen, 
  Link as LinkIcon, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import api from '../../services/api.js';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const counts = stats?.counts || {
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
    totalSubjects: 0,
    totalAssignments: 0
  };

  const metricCards = [
    { title: 'Total Students', count: counts.totalStudents, path: '/admin/students', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { title: 'Total Faculty', count: counts.totalFaculty, path: '/admin/faculty', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { title: 'Departments', count: counts.totalDepartments, path: '/admin/departments', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { title: 'Subjects', count: counts.totalSubjects, path: '/admin/subjects', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { title: 'Faculty Assignments', count: counts.totalAssignments, path: '/admin/assignments', icon: LinkIcon, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Master Data
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview, academic records, and faculty allocations
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-semibold">Notice</p>
            <p className="text-xs sm:text-sm mt-0.5">{error}. Ensure MongoDB is running to load dynamic statistics.</p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.title}
              to={m.path}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              <div className="mt-4">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {loading ? '-' : m.count}
                </div>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">
                  {m.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-600" />
            Quick Academic Actions
          </h2>
          <div className="space-y-2">
            <Link
              to="/admin/students"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-900 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                Enroll New Student
              </span>
              <span className="text-slate-400">&rarr;</span>
            </Link>

            <Link
              to="/admin/faculty"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Register Faculty Member
              </span>
              <span className="text-slate-400">&rarr;</span>
            </Link>

            <Link
              to="/admin/subjects"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-purple-900 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Add Curriculum Subject
              </span>
              <span className="text-slate-400">&rarr;</span>
            </Link>

            <Link
              to="/admin/assignments"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 hover:text-amber-900 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                Assign Faculty to Course
              </span>
              <span className="text-slate-400">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recent Student Enrollments
            </h2>
            <Link to="/admin/students" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : stats?.recentActivities?.recentStudents?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentActivities.recentStudents.map((st) => (
                <div key={st._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{st.userId?.name || 'Student'}</span>
                    <span className="text-slate-500 font-mono">{st.rollNumber} • {st.department} Sem {st.semester}-{st.section}</span>
                  </div>
                  <span className="text-slate-400">
                    {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent enrollments logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
