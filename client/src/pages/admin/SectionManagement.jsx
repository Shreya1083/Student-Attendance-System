import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import api from '../../services/api.js';
import { Modal } from '../../components/Modal.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';

export const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSec, setSelectedSec] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sectionName: 'A',
    department: 'CSE',
    semester: 5,
    academicYear: '2026-2027',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;
      const res = await api.get('/admin/sections', { params });
      setSections(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch sections');
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
    fetchSections();
    fetchDepartments();
  }, [deptFilter, semFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.post('/admin/sections', formData);
      setSuccess('Section configured successfully!');
      setIsAddOpen(false);
      fetchSections();
    } catch (err) {
      setError(err.message || 'Failed to add section');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.put(`/admin/sections/${selectedSec._id}`, formData);
      setSuccess('Section updated!');
      setIsEditOpen(false);
      fetchSections();
    } catch (err) {
      setError(err.message || 'Failed to update section');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      const res = await api.delete(`/admin/sections/${selectedSec._id}`);
      setSuccess(res.message);
      setIsDeleteOpen(false);
      fetchSections();
    } catch (err) {
      setError(err.message || 'Cannot delete section with enrolled students');
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
            <Grid className="w-6 h-6 text-brand-600" />
            Class Sections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure cohort sections for student attendance tracking
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              sectionName: 'A',
              department: departments[0]?.departmentCode || 'CSE',
              semester: 5,
              academicYear: '2026-2027',
              isActive: true
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
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

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d.departmentCode}>{d.departmentCode}</option>
          ))}
        </select>
        <select
          value={semFilter}
          onChange={(e) => setSemFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
        <button onClick={() => { setDeptFilter(''); setSemFilter(''); }} className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
            <p className="text-xs">Loading sections...</p>
          </div>
        ) : sections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sections.map((sec) => (
                  <tr key={sec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono text-sm">
                      Section {sec.sectionName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {sec.department}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Semester {sec.semester}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {sec.academicYear}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sec.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {sec.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => { setSelectedSec(sec); setFormData({ sectionName: sec.sectionName, department: sec.department, semester: sec.semester, academicYear: sec.academicYear, isActive: sec.isActive }); setIsEditOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit Section"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedSec(sec); setIsDeleteOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Section"
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
            <Grid className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No sections found</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Section">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Section Name (e.g. A, B)</label>
            <input
              type="text"
              required
              value={formData.sectionName}
              onChange={(e) => setFormData({ ...formData, sectionName: e.target.value.toUpperCase() })}
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
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
              <span>Save Section</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Section">
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              required
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActiveSec"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActiveSec" className="font-semibold text-slate-700">Active</label>
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
              <span>Update Section</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Section"
        message={`Delete Section ${selectedSec?.sectionName} (${selectedSec?.department} Sem ${selectedSec?.semester})?`}
        confirmText="Delete"
        loading={formLoading}
      />
    </div>
  );
};
