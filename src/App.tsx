
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Application from "./pages/candidate/Application";
import StorageTest from "./pages/candidate/StorageTest";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DirectorDashboard from "./pages/dashboard/DirectorDashboard";
import Training from "./pages/training/Training";
import Quiz from "./pages/training/Quiz";
import AssessmentQuiz from "./pages/training/AssessmentQuiz";
import VideoPlayer from "./pages/training/VideoPlayer";
import Candidates from "./pages/manager/Candidates";
import CandidateDetail from "./pages/manager/CandidateDetail";
import JobApplicationDetail from "./pages/manager/JobApplicationDetail";
import Assessments from "./pages/manager/Assessments";
import Analytics from "./pages/manager/Analytics";
import Interviews from "./pages/manager/Interviews";
import Profile from "./pages/common/Profile";
import UserManagement from "./pages/admin/UserManagement";
import ActivityLog from "./pages/admin/ActivityLog";
import TrainingManagement from "./pages/admin/TrainingManagement";
import AssessmentDetails from "./pages/admin/AssessmentDetails";
import AssessmentResultDetails from "./pages/admin/AssessmentResultDetails";
import AssessmentSectionDetails from "./pages/admin/AssessmentSectionDetails";
import TrainingModuleDetails from "./pages/admin/TrainingModuleDetails";
import QuestionDetails from "./pages/admin/QuestionDetails";
import JobOpenings from "./pages/candidate/JobOpenings";
import JobManagement from "./pages/hr/JobManagement";
import { AuthProvider } from "./contexts/auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ModuleView from "./pages/training/ModuleView";
import Careers from "./pages/public/Careers";
import Applications from "./pages/manager/Applications";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/application" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <Application />
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
              <Route path="/dashboard/director" element={
                <ProtectedRoute allowedRoles={['director']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/hr" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Applications routes */}
              <Route path="/applications" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <Applications />
                </ProtectedRoute>
              } />
              <Route path="/applications/:id" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <JobApplicationDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/training" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <Training />
                </ProtectedRoute>
              } />
              <Route path="/training/quiz/:moduleId" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <Quiz />
                </ProtectedRoute>
              } />
              <Route path="/training/assessment/:assessmentId" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <AssessmentQuiz />
                </ProtectedRoute>
              } />
              <Route path="/training/video/:moduleId/:videoId" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <VideoPlayer />
                </ProtectedRoute>
              } />
              
              <Route path="/candidates" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <Candidates />
                </ProtectedRoute>
              } />
              <Route path="/candidates/:id" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <CandidateDetail />
                </ProtectedRoute>
              } />
              <Route path="/interviews" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <Interviews />
                </ProtectedRoute>
              } />
              <Route path="/assessments" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <Assessments />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'hr', 'director']}>
                  <Analytics />
                </ProtectedRoute>
              } />

              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/activity-log" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLog />
                </ProtectedRoute>
              } />
              <Route path="/training-management" element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <TrainingManagement />
                </ProtectedRoute>
              } />
              
              {/* Assessment management routes */}
              <Route path="/training-management/assessments/create" element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              } />
              <Route path="/training-management/assessments/:assessmentId" element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              } />
              <Route path="/training-management/assessments/:assessmentId/edit" element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/assessments/results/:resultId" element={
                <ProtectedRoute allowedRoles={['admin', 'hr', 'director']}>
                  <AssessmentResultDetails />
                </ProtectedRoute>
              } />
              <Route path="/assessments/:assessmentId" element={
                <ProtectedRoute allowedRoles={['admin', 'hr', 'director']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              } />
              <Route path="/assessments/:assessmentId/edit" element={
                <ProtectedRoute allowedRoles={['admin', 'hr', 'director']}>
                  <AssessmentDetails />
                </ProtectedRoute>
              } />
              <Route path="/assessments/sections/new" element={
                <ProtectedRoute allowedRoles={['admin', 'hr', 'director']}>
                  <AssessmentSectionDetails />
                </ProtectedRoute>
              } />
              <Route path="/assessments/sections/:sectionId" element={
                <ProtectedRoute allowedRoles={['admin', 'hr', 'director']}>
                  <AssessmentSectionDetails />
                </ProtectedRoute>
              } />
              <Route path="/questions/:questionId" element={
                <ProtectedRoute allowedRoles={['admin', 'hr', 'director']}>
                  <QuestionDetails />
                </ProtectedRoute>
              } />
              <Route path="/training-management/:moduleId" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TrainingModuleDetails />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['candidate', 'manager', 'admin', 'hr', 'director']}>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/job-openings" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <JobOpenings />
                </ProtectedRoute>
              } />
              <Route path="/hr/job-management" element={
                <ProtectedRoute allowedRoles={['hr', 'director']}>
                  <JobManagement />
                </ProtectedRoute>
              } />
              <Route path="/training/module/:moduleId" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <ModuleView />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Sonner />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
