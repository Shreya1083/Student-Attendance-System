import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Lock,
  Mail,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  BookOpen,
  Layers,
  Hash,
  ArrowRight
} from 'lucide-react';
import api from '../services/api.js';

export const SignUpPage = () => {
  const { register, isAuthenticated, user, getRoleDashboardPath, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'CSE',
    semester: 5,
    section: 'A'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Dynamic dropdown options
  const [academicOptions, setAcademicOptions] = useState({
    departments: [
      { departmentCode: 'CSE', departmentName: 'Computer Science & Engineering' },
      { departmentCode: 'ECE', departmentName: 'Electronics & Communication' },
      { departmentCode: 'MECH', departmentName: 'Mechanical Engineering' }
    ],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    sections: ['A', 'B', 'C']
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // If already authenticated, redirect to their role dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  // Fetch dynamic academic options on mount
  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      try {
        const res = await api.get('/auth/academic-options');
        if (isMounted && res.data) {
          const { departments, semesters, sections } = res.data;

          const depts = departments?.length > 0
            ? departments
            : academicOptions.departments;

          const semNumbers = semesters?.length > 0
            ? Array.from(new Set(semesters.map((s) => s.semesterNumber))).sort((a, b) => a - b)
            : [1, 2, 3, 4, 5, 6, 7, 8];

          const secNames = sections?.length > 0
            ? Array.from(new Set(sections.map((s) => s.sectionName))).sort()
            : ['A', 'B', 'C'];

          setAcademicOptions({
            departments: depts,
            semesters: semNumbers,
            sections: secNames
          });

          // Set default department from fetched options if available
          if (depts.length > 0 && !formData.department) {
            setFormData((prev) => ({ ...prev, department: depts[0].departmentCode }));
          }
        }
      } catch {
        // Fallbacks remain active if options call fails
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    };

    fetchOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rollNumber' ? value.toUpperCase() : value
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
    setErrorMessage('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters long';
    }

    if (!formData.rollNumber.trim() || formData.rollNumber.trim().length < 2) {
      errors.rollNumber = 'Valid USN / Student ID is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please provide a valid institutional email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one numeric digit';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.department) {
      errors.department = 'Department is required';
    }

    if (!formData.semester) {
      errors.semester = 'Semester is required';
    }

    if (!formData.section) {
      errors.section = 'Section is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        department: formData.department,
        semester: Number(formData.semester),
        section: formData.section.toUpperCase(),
        academicYear: '2026-2027'
      };

      await register(payload);
      setSuccessMessage('Account created successfully! Redirecting to student portal...');
      setTimeout(() => {
        navigate('/student/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Student Account
          </h2>
          <p className="text-sm text-slate-500">
            Student Attendance and Notification System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold text-rose-800">Registration Error</p>
                <p className="mt-0.5 text-xs sm:text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">Registration Successful</p>
                <p className="mt-0.5 text-xs sm:text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name & USN Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priya Sharma"
                    className={`block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                      validationErrors.name
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.name}</p>
                )}
              </div>

              {/* USN / Student ID */}
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-semibold text-slate-700 mb-1">
                  USN / Student ID *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 1SI24CS167"
                    className={`block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono border transition-colors focus:outline-none focus:ring-2 ${
                      validationErrors.rollNumber
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                  />
                </div>
                {validationErrors.rollNumber && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.rollNumber}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Institutional Email *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. priya@college.edu"
                  className={`block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                    validationErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Academic Cohort Row (Department, Semester, Section) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-xs font-semibold text-slate-700 mb-1">
                  Department *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-slate-300 focus:border-brand-500 focus:ring-brand-100 bg-white"
                  >
                    {academicOptions.departments.map((dept) => (
                      <option key={dept.departmentCode} value={dept.departmentCode}>
                        {dept.departmentCode} - {dept.departmentName || dept.departmentCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-xs font-semibold text-slate-700 mb-1">
                  Semester *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-slate-300 focus:border-brand-500 focus:ring-brand-100 bg-white"
                  >
                    {academicOptions.semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section */}
              <div>
                <label htmlFor="section" className="block text-xs font-semibold text-slate-700 mb-1">
                  Section *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-slate-300 focus:border-brand-500 focus:ring-brand-100 bg-white"
                  >
                    {academicOptions.sections.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                      validationErrors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                      validationErrors.confirmPassword
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Password must be at least 8 characters long, including an uppercase letter and a number.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white bg-brand-600 hover:bg-brand-700 font-semibold text-sm shadow-md shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-60 transition-all cursor-pointer mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Student Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Sign In */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
