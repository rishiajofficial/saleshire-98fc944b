
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CandidateDashboard from './pages/dashboard/CandidateDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import HRDashboard from './pages/dashboard/HRDashboard';
import DirectorDashboard from './pages/dashboard/DirectorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Assessments from './pages/manager/Assessments';
import AssessmentDetails from './pages/admin/AssessmentDetails';
import Training from './pages/training/Training';
import AssessmentQuiz from './pages/training/AssessmentQuiz';
import Application from './pages/candidate/Application';
import Candidates from './pages/manager/Candidates';
import CandidateDetail from './pages/manager/CandidateDetail';
import Managers from './pages/admin/Managers';
import ManagerDetail from './pages/admin/ManagerDetail';
import HR from './pages/admin/HR';
import HRDetail from './pages/admin/HRDetail';
import Directors from './pages/admin/Directors';
import DirectorDetail from './pages/admin/DirectorDetail';
import ActivityLog from './pages/admin/ActivityLog';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Profile from './pages/common/Profile';
import Interviews from './pages/manager/Interviews';
import SectionDetails from './pages/admin/SectionDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Candidate Routes */}
          <Route path="/dashboard/candidate" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/application" element={<ProtectedRoute allowedRoles={['candidate']}><Application /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute allowedRoles={['candidate']}><Training /></ProtectedRoute>} />
          <Route path="/assessments/:assessmentId/quiz" element={<ProtectedRoute allowedRoles={['candidate']}><AssessmentQuiz /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute allowedRoles={['candidate', 'manager', 'hr', 'director', 'admin']}><Profile /></ProtectedRoute>} />

          {/* Manager Routes */}
          <Route path="/dashboard/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><Assessments /></ProtectedRoute>} />
          <Route path="/assessments/:assessmentId" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><AssessmentDetails /></ProtectedRoute>} />
          <Route path="/candidates" element={<ProtectedRoute allowedRoles={['manager', 'hr', 'director', 'admin']}><Candidates /></ProtectedRoute>} />
          <Route path="/candidates/:candidateId" element={<ProtectedRoute allowedRoles={['manager', 'hr', 'director', 'admin']}><CandidateDetail /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute allowedRoles={['manager', 'hr']}><Interviews /></ProtectedRoute>} />

          {/* HR Routes */}
          <Route path="/dashboard/hr" element={<ProtectedRoute allowedRoles={['hr']}><HRDashboard /></ProtectedRoute>} />

          {/* Director Routes */}
          <Route path="/dashboard/director" element={<ProtectedRoute allowedRoles={['director']}><DirectorDashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/managers" element={<ProtectedRoute allowedRoles={['admin']}><Managers /></ProtectedRoute>} />
          <Route path="/managers/:managerId" element={<ProtectedRoute allowedRoles={['admin']}><ManagerDetail /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['admin']}><HR /></ProtectedRoute>} />
          <Route path="/hr/:hrId" element={<ProtectedRoute allowedRoles={['admin']}><HRDetail /></ProtectedRoute>} />
          <Route path="/directors" element={<ProtectedRoute allowedRoles={['admin']}><Directors /></ProtectedRoute>} />
          <Route path="/directors/:directorId" element={<ProtectedRoute allowedRoles={['admin']}><DirectorDetail /></ProtectedRoute>} />
          <Route path="/activity-logs" element={<ProtectedRoute allowedRoles={['admin']}><ActivityLog /></ProtectedRoute>} />

          <Route path="/assessments/:assessmentId/sections/:sectionId" element={<ProtectedRoute allowedRoles={['admin']}><SectionDetails /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
