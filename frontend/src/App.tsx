import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProviderWrapper } from "./context/ThemeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./authentication/AuthProvider";
import ErrorPage from "./pages/ErrorPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { LanguageProvider } from "./context/LanguageProvider";
import Navigation from "./layout/Navigation";
import withAuthRedirect from "./hoc/withAuthRedirect";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import StudyPlanPage from "./pages/StudyPlanPage";

const queryClient = new QueryClient();

const ProtectedDashboard = withAuthRedirect(Dashboard);
const ProtectedTasks = withAuthRedirect(TasksPage);
const ProtectedSubjects = withAuthRedirect(SubjectsPage);
const ProtectedSubjectDetail = withAuthRedirect(SubjectDetailPage);
const ProtectedStudyPlan = withAuthRedirect(StudyPlanPage);

function App() {
  return (
    <>
      <ThemeProviderWrapper>
        <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <Navigation>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<ProtectedDashboard />} />
                    <Route path="/tasks" element={<ProtectedTasks />} />
                    <Route path="/subjects" element={<ProtectedSubjects />} />
                    <Route path="/subjects/:subjectId" element={<ProtectedSubjectDetail />} />
                    <Route path="/study-plan" element={<ProtectedStudyPlan />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
              </Navigation>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
        </LanguageProvider>
      </ThemeProviderWrapper>
    </>
  );
}

export default App;
