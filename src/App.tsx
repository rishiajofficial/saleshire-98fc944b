
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Application from "./pages/candidate/Application";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Training from "./pages/training/Training";
import Quiz from "./pages/training/Quiz";
import AssessmentQuiz from "./pages/training/AssessmentQuiz";
import VideoPlayer from "./pages/training/VideoPlayer";
import Candidates from "./pages/manager/Candidates";
import CandidateDetail from "./pages/manager/CandidateDetail";
import Assessments from "./pages/manager/Assessments";
import Analytics from "./pages/manager/Analytics";
import Profile from "./pages/common/Profile";
import UserManagement from "./pages/admin/UserManagement";
import ActivityLog from "./pages/admin/ActivityLog";
import TrainingManagement from "./pages/admin/TrainingManagement";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/application" element={<Application />} />
            
            {/* Protected Routes */}
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
            
            {/* Manager Routes */}
            <Route path="/candidates" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <Candidates />
              </ProtectedRoute>
            } />
            <Route path="/candidates/:id" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <CandidateDetail />
              </ProtectedRoute>
            } />
            <Route path="/assessments" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <Assessments />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <Analytics />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
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
              <ProtectedRoute allowedRoles={['admin']}>
                <TrainingManagement />
              </ProtectedRoute>
            } />

            {/* Common Routes */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['candidate', 'manager', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
