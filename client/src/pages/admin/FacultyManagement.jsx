import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
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

export const FacultyManagement = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    facultyCode: '',
    department: 'CSE',
    designation: 'Assistant Professor'
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchFaculty = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;

      const res = await api.get('/admin/faculty', { params });
      setFacultyList(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty list');
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
    fetchFaculty();
    fetchDepartments();
  }, [deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFaculty();
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.post('/admin/faculty', formData);
      setSuccess('Faculty registered successfully!');
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        facultyCode: '',
        department: departments[0]?.departmentCode || 'CSE',
        designation: 'Assistant Professor'
      });
      fetchFaculty();
    } catch (err) {
      setError(err.message || 'Failed to register faculty');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.put(`/admin/faculty/${selectedFaculty._id}`, formData);
      setSuccess('Faculty profile updated successfully!');
      setIsEditOpen(false);
      fetchFaculty();
    } catch (err) {
      setError(err.message || 'Failed to update faculty');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/admin/faculty/${selectedFaculty._id}`);
      setSuccess(`Faculty ${selectedFaculty.facultyCode} deactivated`);
      setIsDeactivateOpen(false);
      fetchFaculty();
    } catch (err) {
      setError(err.message || 'Failed to deactivate faculty');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (faculty) => {
    setSelectedFaculty(faculty);
    setFormData({
      name: faculty.userId?.name || '',
      email: faculty.userId?.email || '',
      facultyCode: faculty.facultyCode,
      department: faculty.department,
      designation: faculty.designation || 'Assistant Professor'
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Faculty Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage instructional staff, faculty codes, and departmental appointments
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: '',
              facultyCode: '',
              department: departments[0]?.departmentCode || 'CSE',
              designation: 'Assistant Professor'
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Faculty</span>
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or faculty code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
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

          <button
            onClick={() => { setSearch(''); setDeptFilter(''); }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <p className="text-xs">Loading faculty members...</p>
          </div>
        ) : facultyList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Faculty Code</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyList.map((faculty) => (
                  <tr key={faculty._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {faculty.facultyCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {faculty.userId?.name || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {faculty.userId?.email || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium font-mono text-[11px]">
                        {faculty.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {faculty.designation}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          faculty.isActive && faculty.userId?.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {faculty.isActive && faculty.userId?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => { setSelectedFaculty(faculty); setIsDetailOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(faculty)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit Faculty"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedFaculty(faculty); setIsDeactivateOpen(true); }}
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
            <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No faculty members found</p>
            <p className="text-xs">Click "Register Faculty" to add instructors to the directory.</p>
          </div>
        )}
      </div>

      {/* Add Faculty Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Robert Vance"
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
              placeholder="robert.vance@attendance.edu"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Code</label>
              <input
                type="text"
                required
                value={formData.facultyCode}
                onChange={(e) => setFormData({ ...formData, facultyCode: e.target.value.toUpperCase() })}
                placeholder="FAC-CSE-002"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Defaults to Faculty@123"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Associate Professor"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
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
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center space-x-2"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Register Faculty</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Faculty Profile">
        <form onSubmit={handleUpdateFaculty} className="space-y-4 text-xs">
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
              <label className="block font-semibold text-slate-700 mb-1">Faculty Code</label>
              <input
                type="text"
                required
                value={formData.facultyCode}
                onChange={(e) => setFormData({ ...formData, facultyCode: e.target.value.toUpperCase() })}
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
            />
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
        title="Deactivate Faculty Account"
        message={`Are you sure you want to deactivate faculty member ${selectedFaculty?.facultyCode} (${selectedFaculty?.userId?.name})? They will no longer be able to log in or mark attendance.`}
        confirmText="Deactivate"
        loading={formLoading}
      />

      {/* Detail Modal */}
      {selectedFaculty && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Faculty Profile Overview">
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Faculty Code:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedFaculty.facultyCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{selectedFaculty.userId?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono text-slate-800">{selectedFaculty.userId?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold text-slate-800">{selectedFaculty.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Designation:</span>
                <span className="text-slate-800">{selectedFaculty.designation}</span>
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
