import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Loader2, Sliders } from 'lucide-react';
import api from '../../services/api.js';

export const SettingsManagement = () => {
  const [threshold, setThreshold] = useState(75);
  const [description, setDescription] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/settings', { params: { key: 'LOW_ATTENDANCE_THRESHOLD' } });
      if (res.data) {
        setThreshold(res.data.value || 75);
        setDescription(res.data.description || '');
        setUpdatedAt(res.data.updatedAt);
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const num = Number(threshold);
      if (isNaN(num) || num < 1 || num > 100) {
        throw new Error('Threshold must be a valid percentage between 1% and 100%');
      }

      await api.put('/admin/settings', {
        key: 'LOW_ATTENDANCE_THRESHOLD',
        value: num
      });
      setSuccess('Low-attendance threshold updated successfully!');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to update threshold');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          Institutional System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure institutional thresholds, policies, and notification trigger cutoffs
        </p>
      </div>

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

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Low Attendance Alert Cutoff</h2>
            <p className="text-xs text-slate-500">
              When student attendance drops below this percentage, automated in-app alerts are triggered.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Threshold Percentage (%)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  %
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default is set to 75% per university academic regulation.</p>
            </div>

            {updatedAt && (
              <p className="text-xs text-slate-400">
                Last modified: {new Date(updatedAt).toLocaleString()}
              </p>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Setting</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
