import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import HRDashboard from './pages/dashboard/HRDashboard';
import DirectorDashboard from './pages/dashboard/DirectorDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Application from './pages/candidate/Application';
import Training from './pages/candidate/Training';
import { Toaster } from 'sonner';
import CandidateJobOpenings from "@/pages/candidate/CandidateJobOpenings";
import JobManagement from './pages/hr/JobManagement';
import CreateJob from './pages/hr/CreateJob';
import EditJob from './pages/hr/EditJob';
import ViewApplication from './pages/hr/ViewApplication';
import ViewAllApplications from './pages/hr/ViewAllApplications';
import TrainingManagement from './pages/admin/TrainingManagement';
import CreateTrainingModule from './pages/admin/CreateTrainingModule';
import EditTrainingModule from './pages/admin/EditTrainingModule';
import ModuleDetails from './pages/admin/ModuleDetails';
import AssessmentManagement from './pages/admin/AssessmentManagement';
import CreateAssessment from './pages/admin/CreateAssessment';
import EditAssessment from './pages/admin/EditAssessment';
import ViewAssessment from './pages/admin/ViewAssessment';
import UserManagement from './pages/admin/UserManagement';
import EditUser from './pages/admin/EditUser';
import ViewUser from './pages/admin/ViewUser';
import PerformanceReviews from './pages/manager/PerformanceReviews';
import CreateReview from './pages/manager/CreateReview';
import EditReview from './pages/manager/EditReview';
import ViewReview from './pages/manager/ViewReview';
import TeamManagement from './pages/director/TeamManagement';
import ViewTeam from './pages/director/ViewTeam';
import EditTeam from './pages/director/EditTeam';
import ViewEmployee from './pages/director/ViewEmployee';

function App() {
  return (
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
          <Route
            path="/admin/training-management"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TrainingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-training-module"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateTrainingModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-training-module/:moduleId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditTrainingModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/module-details/:moduleId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ModuleDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assessment-management"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AssessmentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-assessment"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-assessment/:assessmentId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/view-assessment/:assessmentId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ViewAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-management"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-user/:userId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/view-user/:userId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ViewUser />
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
          <Route
            path="/manager/performance-reviews"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <PerformanceReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/create-review"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <CreateReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/edit-review/:reviewId"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <EditReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/view-review/:reviewId"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ViewReview />
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
          <Route
            path="/hr/job-management"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <JobManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/create-job"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/edit-job/:jobId"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <EditJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/view-application/:applicationId"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <ViewApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/view-all-applications/:jobId"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <ViewAllApplications />
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
          <Route
            path="/director/team-management"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <TeamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/director/view-team/:teamId"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <ViewTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/director/edit-team/:teamId"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <EditTeam />
              </ProtectedRoute>
            }
          />
           <Route
            path="/director/view-employee/:employeeId"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <ViewEmployee />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
