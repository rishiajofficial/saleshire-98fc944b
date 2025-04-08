import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import DirectorDashboard from './pages/director/DirectorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Assessments from './pages/manager/Assessments';
import AssessmentDetails from './pages/admin/AssessmentDetails';
import Training from './pages/training/Training';
import AssessmentQuiz from './pages/training/AssessmentQuiz';
import Application from './pages/candidate/Application';
import AllCandidates from './pages/manager/AllCandidates';
import CandidateDetails from './pages/manager/CandidateDetails';
import AllManagers from './pages/admin/AllManagers';
import ManagerDetails from './pages/admin/ManagerDetails';
import AllHR from './pages/admin/AllHR';
import HRDetails from './pages/admin/HRDetails';
import AllDirectors from './pages/admin/AllDirectors';
import DirectorDetails from './pages/admin/DirectorDetails';
import ActivityLogs from './pages/admin/ActivityLogs';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import EditProfile from './pages/EditProfile';
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
          <Route path="/dashboard/candidate" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/application" element={<ProtectedRoute><Application /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
          <Route path="/assessments/:assessmentId/quiz" element={<ProtectedRoute><AssessmentQuiz /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

          {/* Manager Routes */}
          <Route path="/dashboard/manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
           <Route path="/assessments/:assessmentId" element={<ProtectedRoute><AssessmentDetails /></ProtectedRoute>} />
          <Route path="/candidates" element={<ProtectedRoute><AllCandidates /></ProtectedRoute>} />
          <Route path="/candidates/:candidateId" element={<ProtectedRoute><CandidateDetails /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />

          {/* HR Routes */}
          <Route path="/dashboard/hr" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />

          {/* Director Routes */}
          <Route path="/dashboard/director" element={<ProtectedRoute><DirectorDashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/managers" element={<ProtectedRoute><AllManagers /></ProtectedRoute>} />
          <Route path="/managers/:managerId" element={<ProtectedRoute><ManagerDetails /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute><AllHR /></ProtectedRoute>} />
          <Route path="/hr/:hrId" element={<ProtectedRoute><HRDetails /></ProtectedRoute>} />
          <Route path="/directors" element={<ProtectedRoute><AllDirectors /></ProtectedRoute>} />
          <Route path="/directors/:directorId" element={<ProtectedRoute><DirectorDetails /></ProtectedRoute>} />
          <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />

          <Route path="/assessments/:assessmentId/sections/:sectionId" element={<SectionDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
