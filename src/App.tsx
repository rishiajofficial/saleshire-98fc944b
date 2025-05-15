import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Auth-related imports
import { AuthProvider } from "@/contexts/auth";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Careers from "@/pages/public/Careers";

// Dashboard pages
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import ManagerDashboard from "@/pages/dashboard/ManagerDashboard";
import HRDashboard from "@/pages/dashboard/HRDashboard";
import CandidateDashboard from "@/pages/dashboard/CandidateDashboard";
import DirectorDashboard from "@/pages/dashboard/DirectorDashboard";

// Manager pages
import Candidates from "@/pages/manager/Candidates";
import CandidateDetail from "@/pages/manager/CandidateDetail";
import Applications from "@/pages/manager/Applications";
import JobApplicationDetail from "@/pages/manager/JobApplicationDetail";
import Interviews from "@/pages/manager/Interviews";
import Assessments from "@/pages/manager/Assessments";
import Analytics from "@/pages/manager/Analytics";

// HR pages
import JobManagement from "@/pages/hr/JobManagement";

// Candidate pages
import Application from "@/pages/candidate/Application";
import JobOpenings from "@/pages/candidate/JobOpenings";
import StorageTest from "@/pages/candidate/StorageTest";

// Admin pages
import UserManagement from "@/pages/admin/UserManagement";
import CompanyManagement from "@/pages/admin/CompanyManagement";
import TrainingManagement from "@/pages/admin/TrainingManagement";
import ActivityLog from "@/pages/admin/ActivityLog";
import TrainingModuleDetails from "@/pages/admin/TrainingModuleDetails";

// Training pages
import Training from "@/pages/training/Training";
import ModuleView from "@/pages/training/ModuleView";
import VideoPlayer from "@/pages/training/VideoPlayer";
import Quiz from "@/pages/training/Quiz";
import AssessmentQuiz from "@/pages/training/AssessmentQuiz";

// Common pages
import Profile from "@/pages/common/Profile";

// Assessment pages
import AssessmentDetails from "@/pages/admin/AssessmentDetails";
import AssessmentSectionDetails from "@/pages/admin/AssessmentSectionDetails";
import AssessmentResultDetails from "@/pages/admin/AssessmentResultDetails";
import QuestionDetails from "@/pages/admin/QuestionDetails";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/careers" element={<Careers />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CompanyManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-log"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ActivityLog />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/candidates"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/candidates/:id"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <CandidateDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/applications"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/applications/:id"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <JobApplicationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/interviews"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Interviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/assessments"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Assessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/analytics"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* HR Routes */}
        <Route
          path="/dashboard/hr"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <JobManagement />
            </ProtectedRoute>
          }
        />

        {/* Director Routes */}
        <Route
          path="/dashboard/director"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <DirectorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Training Routes - Available to all roles */}
        <Route
          path="/training"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager", "candidate", "director"]}>
              <Training />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/module/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager", "candidate", "director"]}>
              <ModuleView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/video/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager", "candidate", "director"]}>
              <VideoPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/quiz/:moduleId"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager", "candidate", "director"]}>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/assessment/:assessmentId"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager", "candidate", "director"]}>
              <AssessmentQuiz />
            </ProtectedRoute>
          }
        />

        {/* Training Management */}
        <Route
          path="/admin/training"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <TrainingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/training/module/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <TrainingModuleDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <AssessmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:assessmentId/sections/:sectionId"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <AssessmentSectionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:assessmentId/results/:resultId"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <AssessmentResultDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <QuestionDetails />
            </ProtectedRoute>
          }
        />

        {/* Candidate Routes */}
        <Route
          path="/dashboard/candidate"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Application />
            </ProtectedRoute>
          }
        />
        <Route
          path="/openings"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <JobOpenings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-storage"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <StorageTest />
            </ProtectedRoute>
          }
        />

        {/* Common Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager", "candidate", "director"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
