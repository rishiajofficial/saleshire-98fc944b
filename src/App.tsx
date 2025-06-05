
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/auth';
import Index from './pages/Index';
import Careers from './pages/public/Careers';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import CandidateDashboard from './pages/dashboard/CandidateDashboard';
import DirectorDashboard from './pages/dashboard/DirectorDashboard';
import HRDashboard from './pages/dashboard/HRDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Application from './pages/candidate/Application';
import { Toaster } from 'sonner';
import CandidateJobOpenings from "@/pages/candidate/CandidateJobOpenings";
import Training from './pages/training/Training';
import JobManagement from './pages/hr/JobManagement';
import Applications from './pages/manager/Applications';
import Candidates from './pages/manager/Candidates';
import Assessments from './pages/manager/Assessments';
import TrainingManagement from './pages/admin/TrainingManagement';
import AssessmentDetails from './pages/admin/AssessmentDetails';
import QuestionDetails from './pages/admin/QuestionDetails';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected candidate routes */}
            <Route
              path="/dashboard/candidate"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/jobs"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateJobOpenings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <Application />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <Training />
                </ProtectedRoute>
              }
            />

            {/* Protected admin routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected HR routes */}
            <Route
              path="/dashboard/hr"
              element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected manager routes */}
            <Route
              path="/dashboard/manager"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected director routes */}
            <Route
              path="/dashboard/director"
              element={
                <ProtectedRoute allowedRoles={['director']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared HR/Manager/Admin routes */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute allowedRoles={['hr', 'manager', 'admin']}>
                  <JobManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['hr', 'manager', 'admin']}>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedRoute allowedRoles={['hr', 'manager', 'admin']}>
                  <Candidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments"
              element={
                <ProtectedRoute allowedRoles={['hr', 'manager', 'admin']}>
                  <Assessments />
                </ProtectedRoute>
              }
            />

            {/* Training and Assessment Management Routes */}
            <Route
              path="/training-management"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <TrainingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/:assessmentId"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/:assessmentId/edit"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/create"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/:questionId"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <QuestionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/create"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <QuestionDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
