import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { RootLayout } from './layouts/RootLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignUpPage } from './pages/SignUpPage.jsx';
import { UnauthorizedPage } from './pages/UnauthorizedPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { StudentManagement } from './pages/admin/StudentManagement.jsx';
import { FacultyManagement } from './pages/admin/FacultyManagement.jsx';
import { DepartmentManagement } from './pages/admin/DepartmentManagement.jsx';
import { SemesterManagement } from './pages/admin/SemesterManagement.jsx';
import { SectionManagement } from './pages/admin/SectionManagement.jsx';
import { SubjectManagement } from './pages/admin/SubjectManagement.jsx';
import { FacultyAssignmentManagement } from './pages/admin/FacultyAssignmentManagement.jsx';
import { SettingsManagement } from './pages/admin/SettingsManagement.jsx';

// Role Dashboards
import { FacultyDashboard } from './pages/faculty/FacultyDashboard.jsx';
import { MarkAttendance } from './pages/faculty/MarkAttendance.jsx';
import { StudentDashboard } from './pages/student/StudentDashboard.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Root Layout Routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
              <Route path="faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="faculty/attendance" element={<MarkAttendance />} />
            </Route>

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="student/dashboard" element={<StudentDashboard />} />
            </Route>

            {/* 404 Fallback for non-admin */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Protected Admin Routes with Dedicated Sidebar AdminLayout */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="faculty" element={<FacultyManagement />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="semesters" element={<SemesterManagement />} />
              <Route path="sections" element={<SectionManagement />} />
              <Route path="subjects" element={<SubjectManagement />} />
              <Route path="assignments" element={<FacultyAssignmentManagement />} />
              <Route path="settings" element={<SettingsManagement />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
