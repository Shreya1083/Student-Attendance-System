import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  BookOpen,
  UserCheck
} from 'lucide-react';
import api from '../../services/api.js';
import { Modal } from '../../components/Modal.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';

export const FacultyAssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    facultyId: '',
    subjectId: '',
    department: 'CSE',
    semester: 5,
    section: 'A',
    academicYear: '2026-2027'
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (deptFilter) params.department = deptFilter;
      const res = await api.get('/admin/assignments', { params });
      setAssignments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [facRes, subRes, deptRes] = await Promise.all([
        api.get('/admin/faculty'),
        api.get('/admin/subjects'),
        api.get('/admin/departments')
      ]);
      setFacultyList(facRes.data || []);
      setSubjectList(subRes.data || []);
      setDepartmentList(deptRes.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchAssignments();
    loadReferenceData();
  }, [deptFilter]);

  // Filter available faculty and subjects matching currently selected department in the form
  const filteredFaculty = facultyList.filter((f) => f.department === formData.department && f.isActive);
  const filteredSubjects = subjectList.filter((s) => s.department === formData.department && s.semester === formData.semester && s.isActive);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      if (!formData.facultyId) throw new Error('Please select a faculty member');
      if (!formData.subjectId) throw new Error('Please select an authorized subject');

      await api.post('/admin/assignments', formData);
      setSuccess('Faculty assigned to course successfully!');
      setIsAddOpen(false);
      setFormData({
        facultyId: '',
        subjectId: '',
        department: departmentList[0]?.departmentCode || 'CSE',
        semester: 5,
        section: 'A',
        academicYear: '2026-2027'
      });
      fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to create faculty assignment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      const res = await api.delete(`/admin/assignments/${selectedAssignment._id}`);
      setSuccess(res.message);
      setIsDeleteOpen(false);
      fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to remove assignment');
      setIsDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-amber-600" />
            Faculty Course Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Map faculty to subjects and sections. Only assigned faculty can mark attendance.
          </p>
        </div>

        <button
          onClick={() => {
            const initialDept = departmentList[0]?.departmentCode || 'CSE';
            setFormData({
              facultyId: '',
              subjectId: '',
              department: initialDept,
              semester: 5,
              section: 'A',
              academicYear: '2026-2027'
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Course</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 text-xs">Dismiss</button>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-500 hover:text-emerald-700 text-xs">Dismiss</button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Departments</option>
          {departmentList.map((d) => (
            <option key={d._id} value={d.departmentCode}>{d.departmentCode}</option>
          ))}
        </select>
        <button onClick={() => setDeptFilter('')} className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <p className="text-xs">Loading faculty assignments...</p>
          </div>
        ) : assignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4">Assigned Subject</th>
                  <th className="py-3.5 px-4">Cohort</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((as) => (
                  <tr key={as._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {as.facultyId?.userId?.name || 'Faculty'}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {as.facultyId?.facultyCode} • {as.facultyId?.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold font-mono text-slate-900">
                        {as.subjectId?.subjectCode}
                      </div>
                      <div className="text-slate-500">
                        {as.subjectId?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium font-mono text-[11px]">
                        {as.department} • Sem {as.semester} - Section {as.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {as.academicYear}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => { setSelectedAssignment(as); setIsDeleteOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <LinkIcon className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No faculty assignments found</p>
            <p className="text-xs">Click "Assign Course" to map instructors to curriculum subjects.</p>
          </div>
        )}
      </div>

      {/* Add Assignment Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Assign Faculty to Course">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value, facultyId: '', subjectId: '' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {departmentList.map((d) => (
                  <option key={d._id} value={d.departmentCode}>{d.departmentCode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value), subjectId: '' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Faculty Member (must belong to {formData.department})
            </label>
            <select
              required
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Select Faculty...</option>
              {filteredFaculty.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.userId?.name} ({f.facultyCode}) - {f.designation}
                </option>
              ))}
            </select>
            {filteredFaculty.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">No active faculty found for department {formData.department}.</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Subject ({formData.department} Sem {formData.semester})
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Select Subject...</option>
              {filteredSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.name} ({s.credits} Credits)
                </option>
              ))}
            </select>
            {filteredSubjects.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">No active subjects registered for {formData.department} Sem {formData.semester}.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                placeholder="A"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || filteredFaculty.length === 0 || filteredSubjects.length === 0}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center space-x-2 disabled:opacity-60"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Assignment</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Faculty Assignment"
        message="Are you sure you want to remove this faculty course assignment? The faculty member will lose authorization to mark attendance for this section."
        confirmText="Remove"
        loading={formLoading}
      />
    </div>
  );
};
