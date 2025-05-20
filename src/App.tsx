
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
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Company routes */}
              <Route path="/company/register" element={
                <ProtectedRoute>
                  <RegisterCompany />
                </ProtectedRoute>
              } />
              <Route path="/company/settings" element={
                <ProtectedRoute>
                  <CompanySettings />
                </ProtectedRoute>
              } />
              <Route path="/company" element={
                <ProtectedRoute>
                  <CompanyHub />
                </ProtectedRoute>
              } />

              {/* Candidate routes */}
              <Route path="/job-openings" element={
                <ProtectedRoute>
                  <JobOpenings />
                </ProtectedRoute>
              } />
              <Route path="/application" element={
                <ProtectedRoute>
                  <Application />
                </ProtectedRoute>
              } />
              <Route path="/storage-test" element={
                <ProtectedRoute>
                  <StorageTest />
                </ProtectedRoute>
              } />

              {/* Dashboard routes */}
              <Route
                path="/dashboard/candidate"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/manager"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hr"
                element={
                  <ProtectedRoute allowedRoles={["hr", "admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/director"
                element={
                  <ProtectedRoute allowedRoles={["director"]}>
                    <DirectorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Manager routes */}
              <Route
                path="/manager/analytics"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/candidates"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <Candidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/candidates/:candidateId"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <CandidateDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/applications"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/applications/:applicationId"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <JobApplicationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/interviews"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <Interviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/assessments"
                element={
                  <ProtectedRoute allowedRoles={["manager", "hr", "director", "admin"]}>
                    <Assessments />
                  </ProtectedRoute>
                }
              />

              {/* HR routes */}
              <Route
                path="/hr/job-management"
                element={
                  <ProtectedRoute allowedRoles={["hr", "director", "admin"]}>
                    <JobManagement />
                  </ProtectedRoute>
                }
              />

              {/* Training routes */}
              <Route
                path="/training"
                element={
                  <ProtectedRoute>
                    <Training />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training/:moduleId"
                element={
                  <ProtectedRoute>
                    <ModuleView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training/video/:videoId"
                element={
                  <ProtectedRoute>
                    <VideoPlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training/quiz/:moduleId"
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment/:assessmentId"
                element={
                  <ProtectedRoute>
                    <AssessmentQuiz />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/training"
                element={
                  <ProtectedRoute allowedRoles={["admin", "hr"]}>
                    <TrainingManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/training/:moduleId"
                element={
                  <ProtectedRoute allowedRoles={["admin", "hr"]}>
                    <TrainingModuleDetails />
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
                path="/admin/assessments/:assessmentId"
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
                path="/admin/assessments/:assessmentId/sections/:sectionId/questions/:questionId"
                element={
                  <ProtectedRoute allowedRoles={["admin", "hr"]}>
                    <QuestionDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assessment-results/:resultId"
                element={
                  <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
                    <AssessmentResultDetails />
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
