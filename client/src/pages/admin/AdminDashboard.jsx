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
  Plus,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api.js';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [res, attRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/attendance/summary').catch(() => ({ data: null }))
      ]);
      setStats(res.data);
      if (attRes?.data) {
        setAttendanceSummary(attRes.data);
      }
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

      {/* Institutional Attendance & Defaulter Reports */}
      {attendanceSummary && attendanceSummary.reports && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Institutional Attendance & Defaulters Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Class averages and low-attendance alerts across all departments and assigned courses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {attendanceSummary.totalDefaulters} Total Defaulter(s)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-brand-700 border border-indigo-200">
                Threshold: {attendanceSummary.threshold}%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Cohort</th>
                  <th className="py-3 px-3">Faculty Code</th>
                  <th className="py-3 px-3">Conducted</th>
                  <th className="py-3 px-3">Enrolled</th>
                  <th className="py-3 px-3">Class Avg</th>
                  <th className="py-3 px-3">Defaulters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendanceSummary.reports.map((r) => (
                  <tr key={r.assignmentId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">
                      <span className="font-mono font-bold text-brand-600 block">{r.subjectCode}</span>
                      <span className="text-[11px] text-slate-500">{r.subjectName}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {r.department} Sem-{r.semester} ({r.section})
                    </td>
                    <td className="py-3 px-3 font-mono">{r.facultyCode || '-'}</td>
                    <td className="py-3 px-3 font-bold font-mono">{r.totalSessions}</td>
                    <td className="py-3 px-3 font-bold font-mono">{r.totalStudents}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold font-mono ${r.classAverage < attendanceSummary.threshold ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {r.totalSessions === 0 ? 'No Data' : `${r.classAverage}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {r.defaulterCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {r.defaulterCount} student(s)
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
