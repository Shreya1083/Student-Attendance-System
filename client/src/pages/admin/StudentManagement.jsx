import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  UserX
} from 'lucide-react';
import api from '../../services/api.js';
import { Modal } from '../../components/Modal.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: 'CSE',
    semester: 5,
    section: 'A',
    academicYear: '2026-2027'
  });
  const [bulkJson, setBulkJson] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;
      if (secFilter) params.section = secFilter;

      const res = await api.get('/admin/students', { params });
      setStudents(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data || []);
      if (res.data?.length > 0 && !formData.department) {
        setFormData((prev) => ({ ...prev, department: res.data[0].departmentCode }));
      }
    } catch {}
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, [deptFilter, semFilter, secFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.post('/admin/students', formData);
      setSuccess('Student account created successfully!');
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        department: departments[0]?.departmentCode || 'CSE',
        semester: 5,
        section: 'A',
        academicYear: '2026-2027'
      });
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to create student account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.put(`/admin/students/${selectedStudent._id}`, formData);
      setSuccess('Student details updated successfully!');
      setIsEditOpen(false);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to update student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/admin/students/${selectedStudent._id}`);
      setSuccess(`Student ${selectedStudent.rollNumber} deactivated`);
      setIsDeactivateOpen(false);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to deactivate student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of student objects');
      const res = await api.post('/admin/students/bulk', { students: parsed });
      setSuccess(res.message);
      setIsBulkOpen(false);
      setBulkJson('');
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to bulk import students');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.userId?.name || '',
      email: student.userId?.email || '',
      rollNumber: student.rollNumber,
      department: student.department,
      semester: student.semester,
      section: student.section,
      academicYear: student.academicYear
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student registrations, academic cohorts, and enrollments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk JSON</span>
          </button>
          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                password: '',
                rollNumber: '',
                department: departments[0]?.departmentCode || 'CSE',
                semester: 5,
                section: 'A',
                academicYear: '2026-2027'
              });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.departmentCode}>{d.departmentCode}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={secFilter}
            onChange={(e) => setSecFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All Sections</option>
            {['A', 'B', 'C', 'D'].map((sec) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>

          <button
            onClick={() => { setSearch(''); setDeptFilter(''); setSemFilter(''); setSecFilter(''); }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
            <p className="text-xs">Loading students roster...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Cohort</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {student.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {student.userId?.name || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {student.userId?.email || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium font-mono text-[11px]">
                        {student.department} • Sem {student.semester}-{student.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          student.isActive && student.userId?.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.isActive && student.userId?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => { setSelectedStudent(student); setIsDetailOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedStudent(student); setIsDeactivateOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Deactivate Account"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No students found</p>
            <p className="text-xs">Adjust your search filters or click "Enroll Student" to add new records.</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Enroll New Student">
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex.johnson@attendance.edu"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                placeholder="CSE24001"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Defaults to Student@123"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.departmentCode}>{d.departmentCode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                placeholder="A"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center space-x-2"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enroll Student</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center space-x-2"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Dialog */}
      <ConfirmDialog
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Student Account"
        message={`Are you sure you want to deactivate student ${selectedStudent?.rollNumber} (${selectedStudent?.userId?.name})? The student will no longer be able to log in.`}
        confirmText="Deactivate"
        loading={formLoading}
      />

      {/* Bulk JSON Upload Modal */}
      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Bulk Student Import (JSON)">
        <form onSubmit={handleBulkUpload} className="space-y-4 text-xs">
          <p className="text-slate-500 leading-relaxed">
            Paste a JSON array of student objects. Required keys: <code className="font-mono text-brand-600">name, email, rollNumber, department, semester, section, academicYear</code>.
          </p>
          <textarea
            rows="8"
            required
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            placeholder={`[
  {
    "name": "Sarah Connor",
    "email": "sarah@attendance.edu",
    "rollNumber": "CSE24002",
    "department": "CSE",
    "semester": 5,
    "section": "A",
    "academicYear": "2026-2027"
  }
]`}
            className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center space-x-2"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Run Bulk Import</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {selectedStudent && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Student Profile Overview">
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Roll Number:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedStudent.rollNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{selectedStudent.userId?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono text-slate-800">{selectedStudent.userId?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Semester & Section:</span>
                <span className="font-semibold text-slate-800">Sem {selectedStudent.semester} - Section {selectedStudent.section}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Academic Year:</span>
                <span className="text-slate-800">{selectedStudent.academicYear}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
