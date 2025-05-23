
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/common/Profile';
import JobOpenings from './pages/candidate/JobOpenings';
import Application from './pages/candidate/Application';
import CandidateDashboard from './pages/dashboard/CandidateDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import DirectorDashboard from './pages/dashboard/DirectorDashboard';
import Candidates from './pages/manager/Candidates';
import CandidateDetail from './pages/manager/CandidateDetail';
import Training from './pages/training/Training';
import Assessment from './pages/training/AssessmentQuiz';
import AssessmentResult from './pages/training/AssessmentResult';
import ApplicationComplete from './pages/candidate/ApplicationComplete';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HRDashboard from './pages/dashboard/HRDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/job-openings" element={<JobOpenings />} />
          <Route path="/application" element={<Application />} />
          <Route path="/application-complete" element={<ApplicationComplete />} />
          
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'candidate', 'hr', 'director']}>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/candidate" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/manager" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/director" element={
            <ProtectedRoute allowedRoles={['director']}>
              <DirectorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/hr" element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HRDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/candidates" element={
            <ProtectedRoute allowedRoles={['manager', 'hr', 'director']}>
              <Candidates />
            </ProtectedRoute>
          } />
          
          <Route path="/candidates/:id" element={
            <ProtectedRoute allowedRoles={['manager', 'hr', 'director']}>
              <CandidateDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/training" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Training />
            </ProtectedRoute>
          } />
          
          <Route path="/training/assessment/:assessmentId" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Assessment />
            </ProtectedRoute>
          } />
          
          <Route path="/assessment-result/:resultId" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <AssessmentResult />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
