
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/job-openings" element={<JobOpenings />} />
          <Route path="/application" element={<Application />} />
          <Route path="/application-complete" element={<ApplicationComplete />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
          <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/director" element={<DirectorDashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/assessment/:assessmentId" element={<Assessment />} />
          <Route path="/assessment-result/:resultId" element={<AssessmentResult />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
