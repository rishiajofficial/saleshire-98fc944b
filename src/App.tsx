
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/application" element={<Application />} />
          <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
          <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/quiz/:moduleId" element={<Quiz />} />
          <Route path="/training/assessment/:assessmentId" element={<AssessmentQuiz />} />
          <Route path="/training/video/:moduleId/:videoId" element={<VideoPlayer />} />
          
          {/* Manager Routes */}
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Admin Routes */}
          <Route path="/users" element={<UserManagement />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/training-management" element={<TrainingManagement />} />

          {/* Common Routes */}
          <Route path="/profile" element={<Profile />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
