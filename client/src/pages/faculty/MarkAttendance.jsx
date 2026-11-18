import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  History,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api.js';

// ─── Status badge helper ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    PRESENT: { label: 'Present', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    ABSENT:  { label: 'Absent',  cls: 'bg-rose-100 text-rose-700 border-rose-200' },
    LATE:    { label: 'Late',    cls: 'bg-amber-100 text-amber-700 border-amber-200' }
  };
  const { label, cls } = cfg[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${cls}`}>
      {label}
    </span>
  );
};

// ─── Status toggle button ─────────────────────────────────────────────────
const StatusToggle = ({ value, onChange, disabled }) => {
  const statuses = ['PRESENT', 'ABSENT', 'LATE'];
  const styles = {
    PRESENT: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    ABSENT:  'bg-rose-500 hover:bg-rose-600 text-white',
    LATE:    'bg-amber-500 hover:bg-amber-600 text-white'
  };
  const icons = {
    PRESENT: <CheckCircle className="w-3.5 h-3.5" />,
    ABSENT:  <XCircle className="w-3.5 h-3.5" />,
    LATE:    <Clock3 className="w-3.5 h-3.5" />
  };

  const next = statuses[(statuses.indexOf(value) + 1) % statuses.length];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(next)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${styles[value]}`}
    >
      {icons[value]}
      {value}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
export const MarkAttendance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assignmentId = searchParams.get('assignmentId');

  // ── State ──
  const [assignment, setAssignment] = useState(null);
  const [students, setStudents]     = useState([]);
  const [sessions, setSessions]     = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // ── Form state ──
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate]           = useState(today);
  const [slot, setSlot]           = useState('1');
  const [topic, setTopic]         = useState('');
  const [statusMap, setStatusMap] = useState({}); // studentId → status

  // ── Past sessions view ──
  const [showHistory, setShowHistory] = useState(false);
  const [editingSession, setEditingSession]  = useState(null); // { session, records }
  const [editMap, setEditMap]                = useState({});   // recordId → status
  const [savingEdit, setSavingEdit]          = useState(false);
  const [deletingId, setDeletingId]          = useState(null);

  // ── Attendance Report State ──
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!assignmentId) return;
    setLoadingReport(true);
    try {
      const res = await api.get(`/attendance/assignment/${assignmentId}/report`);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoadingReport(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (showReport) fetchReport();
  }, [showReport, fetchReport]);

  // ── Bootstrap: load enrolled students + assignment ──
  useEffect(() => {
    if (!assignmentId) {
      setError('No assignment selected. Please go back to your dashboard.');
      setLoadingInit(false);
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/attendance/assignment/${assignmentId}/students`);
        const { assignment: asgn, students: stList } = res.data;
        setAssignment(asgn);
        setStudents(stList);

        // Initialise all students as PRESENT by default
        const map = {};
        stList.forEach((s) => { map[s._id] = 'PRESENT'; });
        setStatusMap(map);
      } catch (err) {
        setError(err.message || 'Failed to load students for this assignment.');
      } finally {
        setLoadingInit(false);
      }
    })();
  }, [assignmentId]);

  // ── Load past sessions when history panel opens ──
  const fetchSessions = useCallback(async () => {
    if (!assignmentId) return;
    setLoadingSessions(true);
    try {
      const res = await api.get('/attendance/sessions', { params: { assignmentId } });
      setSessions(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load session history.');
    } finally {
      setLoadingSessions(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (showHistory) fetchSessions();
  }, [showHistory, fetchSessions]);

  // ── Submit new session ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (students.length === 0) {
      setError('No enrolled students found for this section.');
      return;
    }

    const records = students.map((s) => ({
      studentId: s._id,
      status: statusMap[s._id] || 'ABSENT'
    }));

    setSubmitting(true);
    try {
      await api.post('/attendance/sessions', {
        assignmentId,
        date,
        sessionSlot: slot,
        topic: topic.trim(),
        records
      });

      const present = records.filter((r) => r.status === 'PRESENT').length;
      const late    = records.filter((r) => r.status === 'LATE').length;
      const absent  = records.filter((r) => r.status === 'ABSENT').length;

      setSuccess(
        `Attendance saved! Present: ${present}, Late: ${late}, Absent: ${absent} — ${records.length} students.`
      );

      // Refresh history list
      if (showHistory) fetchSessions();

    } catch (err) {
      setError(err.message || 'Failed to save attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Bulk-set all students ──
  const markAll = (status) => {
    const map = {};
    students.forEach((s) => { map[s._id] = status; });
    setStatusMap(map);
  };

  // ── Load a session for inline editing ──
  const openSessionEdit = async (session) => {
    try {
      const res = await api.get(`/attendance/sessions/${session._id}`);
      const { session: sess, records } = res.data;
      setEditingSession({ session: sess, records });
      const map = {};
      records.forEach((r) => { map[r._id] = r.status; });
      setEditMap(map);
    } catch (err) {
      setError(err.message || 'Failed to load session records.');
    }
  };

  // ── Save a single record edit ──
  const saveRecordEdit = async (recordId) => {
    setSavingEdit(true);
    setError('');
    try {
      await api.put(`/attendance/records/${recordId}`, { status: editMap[recordId] });
      setSuccess('Record updated successfully.');
      // Refresh the editing session
      openSessionEdit(editingSession.session);
      fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to update record.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete a session ──
  const deleteSession = async (sessionId) => {
    if (!window.confirm('Delete this session and all attendance records? This cannot be undone.')) return;
    setDeletingId(sessionId);
    try {
      await api.delete(`/attendance/sessions/${sessionId}`);
      setSuccess('Session deleted successfully.');
      setEditingSession(null);
      fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to delete session.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Loading / Error States ─────────────────────────────────────────────
  if (loadingInit) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!assignmentId || (!assignment && !error)) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p>No assignment found. Please return to your dashboard.</p>
        <button onClick={() => navigate('/faculty/dashboard')} className="mt-4 text-emerald-600 font-semibold text-sm hover:underline">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const subj = assignment?.subjectId;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">

      {/* ── Back + Title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/faculty/dashboard')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Mark Attendance
          </h1>
          {assignment && (
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {subj?.subjectCode} — {subj?.name} &bull; {assignment.department} Sem {assignment.semester}-{assignment.section} &bull; {assignment.academicYear}
            </p>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-500 hover:text-rose-700 text-xs font-bold">✕</button>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-500 hover:text-emerald-700 text-xs font-bold">✕</button>
        </div>
      )}

      {/* ── Main Marking Form ── */}
      {assignment && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">New Attendance Session</h2>
              <p className="text-xs text-slate-500">{students.length} enrolled student(s) in this section</p>
            </div>
          </div>

          {/* Session Controls */}
          <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            {/* Slot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Period (Slot) *</label>
              <select
                required
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
              >
                {['1','2','3','4','5','6','7','8'].map((s) => (
                  <option key={s} value={s}>Period {s}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Introduction to OS"
                maxLength={200}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Quick mark all */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Mark all as:</span>
            <button type="button" onClick={() => markAll('PRESENT')}
              className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> All Present
            </button>
            <button type="button" onClick={() => markAll('ABSENT')}
              className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1">
              <XCircle className="w-3 h-3" /> All Absent
            </button>
            <span className="text-xs text-slate-400 ml-auto">Click a status to cycle: Present → Absent → Late</span>
          </div>

          {/* Student List */}
          {students.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No enrolled students found</p>
              <p className="text-xs mt-1">Ask admin to enrol students in {assignment.department} Sem {assignment.semester}-{assignment.section}.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <div key={student._id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-slate-400 w-5 text-right flex-shrink-0">{idx + 1}</span>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 text-sm block truncate">
                        {student.userId?.name || 'Student'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{student.rollNumber}</span>
                    </div>
                  </div>

                  <StatusToggle
                    value={statusMap[student._id] || 'ABSENT'}
                    onChange={(newStatus) =>
                      setStatusMap((prev) => ({ ...prev, [student._id]: newStatus }))
                    }
                    disabled={submitting}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Summary + Submit */}
          {students.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-emerald-600">
                  Present: {Object.values(statusMap).filter((s) => s === 'PRESENT').length}
                </span>
                <span className="text-rose-600">
                  Absent: {Object.values(statusMap).filter((s) => s === 'ABSENT').length}
                </span>
                <span className="text-amber-600">
                  Late: {Object.values(statusMap).filter((s) => s === 'LATE').length}
                </span>
                <span className="text-slate-400">/ {students.length} total</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {submitting ? 'Saving…' : 'Save Attendance'}
              </button>
            </div>
          )}
        </form>
      )}

      {/* ── Past Sessions Panel ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-900">Past Sessions</span>
            {sessions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                {sessions.length}
              </span>
            )}
          </div>
          {showHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showHistory && (
          <div className="border-t border-slate-100">
            {loadingSessions ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No sessions recorded yet.</div>
            ) : (
              <div>
                {/* Session list */}
                <div className="divide-y divide-slate-100">
                  {sessions.map((sess) => (
                    <div key={sess._id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-slate-500">Period {sess.sessionSlot}</span>
                          {sess.topic && (
                            <span className="text-xs text-indigo-600 font-medium truncate max-w-[150px]">{sess.topic}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-emerald-600 font-semibold">P: {sess.presentCount}</span>
                          <span className="text-rose-600 font-semibold">A: {sess.absentCount}</span>
                          <span className="text-amber-600 font-semibold">L: {sess.lateCount}</span>
                          <span className="text-slate-400">/ {sess.totalStudents}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openSessionEdit(sess)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                          title="View / Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSession(sess._id)}
                          disabled={deletingId === sess._id}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors disabled:opacity-50"
                          title="Delete session"
                        >
                          {deletingId === sess._id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline edit panel for a selected session */}
                {editingSession && (
                  <div className="border-t-2 border-indigo-200 bg-indigo-50/40 px-6 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                        Editing: {new Date(editingSession.session.date).toLocaleDateString('en-IN')} — Period {editingSession.session.sessionSlot}
                        {editingSession.session.topic && ` — ${editingSession.session.topic}`}
                      </h3>
                      <button
                        onClick={() => setEditingSession(null)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="space-y-1">
                      {editingSession.records.map((rec) => (
                        <div key={rec._id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-white border border-slate-200">
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 text-sm block truncate">
                              {rec.studentId?.userId?.name || 'Student'}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">{rec.studentId?.rollNumber}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={editMap[rec._id] || rec.status}
                              onChange={(e) => setEditMap((prev) => ({ ...prev, [rec._id]: e.target.value }))}
                              className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                              <option value="PRESENT">PRESENT</option>
                              <option value="ABSENT">ABSENT</option>
                              <option value="LATE">LATE</option>
                            </select>

                            {editMap[rec._id] !== rec.status && (
                              <button
                                onClick={() => saveRecordEdit(rec._id)}
                                disabled={savingEdit}
                                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Save
                              </button>
                            )}

                            <StatusBadge status={rec.status} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {editingSession.records.some((r) => r.auditHistory?.length > 0) && (
                      <p className="text-[10px] text-slate-400">
                        ℹ Audit history is recorded server-side for all edits.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Attendance & Defaulter Report Panel ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowReport((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Class Attendance & Defaulter Report</span>
            {reportData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${reportData.defaulterCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {reportData.defaulterCount} Defaulter(s) &bull; Avg {reportData.classAveragePercentage}%
              </span>
            )}
          </div>
          {showReport ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showReport && (
          <div className="border-t border-slate-100 p-6 space-y-6">
            {loadingReport ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : !reportData ? (
              <div className="py-8 text-center text-slate-400 text-sm">Failed to load report data.</div>
            ) : (
              <div className="space-y-6">
                {/* Summary Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Class Average</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                      {reportData.classAveragePercentage}%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Conducted Sessions</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                      {reportData.totalSessionsConducted}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Enrolled Students</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                      {reportData.totalStudents}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Defaulters (&lt; {reportData.threshold}%)</span>
                    <span className={`text-2xl font-extrabold font-mono mt-1 block ${reportData.defaulterCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {reportData.defaulterCount}
                    </span>
                  </div>
                </div>

                {/* Defaulter Alert Warning */}
                {reportData.defaulterCount > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900">Attendance Shortage Notice</p>
                      <p className="mt-0.5 text-xs text-rose-700">
                        {reportData.defaulterCount} student(s) currently have attendance below the institutional cutoff ({reportData.threshold}%). In-app early warning notifications have been dispatched.
                      </p>
                    </div>
                  </div>
                )}

                {/* Student Attendance Breakdown Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">USN / Roll No</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3 text-center">Present</th>
                        <th className="py-2.5 px-3 text-center">Late</th>
                        <th className="py-2.5 px-3 text-center">Absent</th>
                        <th className="py-2.5 px-3 text-center">Attended / Total</th>
                        <th className="py-2.5 px-3 text-center">Percentage</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {reportData.students.map((st) => (
                        <tr key={st.studentId} className={st.isDefaulter ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{st.rollNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{st.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-600">{st.presentCount}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-amber-600">{st.lateCount}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-rose-600">{st.absentCount}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {st.attended} / {st.totalSessions}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-mono font-bold text-sm ${st.isDefaulter ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {st.percentage}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.isDefaulter ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                              {st.isDefaulter ? 'Defaulter' : 'Eligible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
