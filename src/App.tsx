
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "@/pages/Index";
import Careers from "@/pages/public/Careers";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/NotFound";

// Dashboard pages
import CandidateDashboard from "@/pages/dashboard/CandidateDashboard";
import ManagerDashboard from "@/pages/dashboard/ManagerDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import DirectorDashboard from "@/pages/dashboard/DirectorDashboard";

// Candidate pages
import JobOpenings from "@/pages/candidate/JobOpenings";
import Application from "@/pages/candidate/Application";
import StorageTest from "@/pages/candidate/StorageTest";

// Manager pages
import Analytics from "@/pages/manager/Analytics";
import Candidates from "@/pages/manager/Candidates";
import CandidateDetail from "@/pages/manager/CandidateDetail";
import Applications from "@/pages/manager/Applications";
import JobApplicationDetail from "@/pages/manager/JobApplicationDetail";
import Interviews from "@/pages/manager/Interviews";
import Assessments from "@/pages/manager/Assessments";

// HR pages
import JobManagement from "@/pages/hr/JobManagement";

// Common pages
import Profile from "@/pages/common/Profile";

// Training pages
import Training from "@/pages/training/Training";
import ModuleView from "@/pages/training/ModuleView";
import VideoPlayer from "@/pages/training/VideoPlayer";
import Quiz from "@/pages/training/Quiz";
import AssessmentQuiz from "@/pages/training/AssessmentQuiz";

// Admin pages
import TrainingManagement from "@/pages/admin/TrainingManagement";
import TrainingModuleDetails from "@/pages/admin/TrainingModuleDetails";
import UserManagement from "@/pages/admin/UserManagement";
import AssessmentDetails from "@/pages/admin/AssessmentDetails";
import AssessmentSectionDetails from "@/pages/admin/AssessmentSectionDetails";
import QuestionDetails from "@/pages/admin/QuestionDetails";
import AssessmentResultDetails from "@/pages/admin/AssessmentResultDetails";
import ActivityLog from "@/pages/admin/ActivityLog";

// Company pages
import CompanySettings from "@/pages/company/CompanySettings";
import RegisterCompany from "@/pages/company/RegisterCompany";
import CompanyHub from "@/pages/company/CompanyHub";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              
              {/* Company routes */}
              <Route path="/company/register" element={<ProtectedRoute element={<RegisterCompany />} />} />
              <Route path="/company/settings" element={<ProtectedRoute element={<CompanySettings />} />} />
              <Route path="/company" element={<ProtectedRoute element={<CompanyHub />} />} />

              {/* Candidate routes */}
              <Route path="/job-openings" element={<ProtectedRoute element={<JobOpenings />} />} />
              <Route path="/application" element={<ProtectedRoute element={<Application />} />} />
              <Route path="/storage-test" element={<ProtectedRoute element={<StorageTest />} />} />

              {/* Dashboard routes */}
              <Route
                path="/dashboard/candidate"
                element={
                  <ProtectedRoute
                    element={<CandidateDashboard />}
                    allowedRoles={["candidate"]}
                  />
                }
              />
              <Route
                path="/dashboard/manager"
                element={
                  <ProtectedRoute
                    element={<ManagerDashboard />}
                    allowedRoles={["manager"]}
                  />
                }
              />
              <Route
                path="/dashboard/hr"
                element={
                  <ProtectedRoute
                    element={<AdminDashboard />}
                    allowedRoles={["hr", "admin"]}
                  />
                }
              />
              <Route
                path="/dashboard/director"
                element={
                  <ProtectedRoute
                    element={<DirectorDashboard />}
                    allowedRoles={["director"]}
                  />
                }
              />

              {/* Manager routes */}
              <Route
                path="/manager/analytics"
                element={
                  <ProtectedRoute
                    element={<Analytics />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />
              <Route
                path="/manager/candidates"
                element={
                  <ProtectedRoute
                    element={<Candidates />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />
              <Route
                path="/manager/candidates/:candidateId"
                element={
                  <ProtectedRoute
                    element={<CandidateDetail />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />
              <Route
                path="/manager/applications"
                element={
                  <ProtectedRoute
                    element={<Applications />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />
              <Route
                path="/manager/applications/:applicationId"
                element={
                  <ProtectedRoute
                    element={<JobApplicationDetail />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />
              <Route
                path="/manager/interviews"
                element={
                  <ProtectedRoute
                    element={<Interviews />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />
              <Route
                path="/manager/assessments"
                element={
                  <ProtectedRoute
                    element={<Assessments />}
                    allowedRoles={["manager", "hr", "director", "admin"]}
                  />
                }
              />

              {/* HR routes */}
              <Route
                path="/hr/job-management"
                element={
                  <ProtectedRoute
                    element={<JobManagement />}
                    allowedRoles={["hr", "director", "admin"]}
                  />
                }
              />

              {/* Training routes */}
              <Route
                path="/training"
                element={<ProtectedRoute element={<Training />} />}
              />
              <Route
                path="/training/:moduleId"
                element={<ProtectedRoute element={<ModuleView />} />}
              />
              <Route
                path="/training/video/:videoId"
                element={<ProtectedRoute element={<VideoPlayer />} />}
              />
              <Route
                path="/training/quiz/:moduleId"
                element={<ProtectedRoute element={<Quiz />} />}
              />
              <Route
                path="/assessment/:assessmentId"
                element={<ProtectedRoute element={<AssessmentQuiz />} />}
              />

              {/* Admin routes */}
              <Route
                path="/admin/training"
                element={
                  <ProtectedRoute
                    element={<TrainingManagement />}
                    allowedRoles={["admin", "hr"]}
                  />
                }
              />
              <Route
                path="/admin/training/:moduleId"
                element={
                  <ProtectedRoute
                    element={<TrainingModuleDetails />}
                    allowedRoles={["admin", "hr"]}
                  />
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute
                    element={<UserManagement />}
                    allowedRoles={["admin"]}
                  />
                }
              />
              <Route
                path="/admin/assessments/:assessmentId"
                element={
                  <ProtectedRoute
                    element={<AssessmentDetails />}
                    allowedRoles={["admin", "hr"]}
                  />
                }
              />
              <Route
                path="/admin/assessments/:assessmentId/sections/:sectionId"
                element={
                  <ProtectedRoute
                    element={<AssessmentSectionDetails />}
                    allowedRoles={["admin", "hr"]}
                  />
                }
              />
              <Route
                path="/admin/assessments/:assessmentId/sections/:sectionId/questions/:questionId"
                element={
                  <ProtectedRoute
                    element={<QuestionDetails />}
                    allowedRoles={["admin", "hr"]}
                  />
                }
              />
              <Route
                path="/admin/assessment-results/:resultId"
                element={
                  <ProtectedRoute
                    element={<AssessmentResultDetails />}
                    allowedRoles={["admin", "hr", "manager"]}
                  />
                }
              />
              <Route
                path="/admin/activity-log"
                element={
                  <ProtectedRoute
                    element={<ActivityLog />}
                    allowedRoles={["admin"]}
                  />
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
