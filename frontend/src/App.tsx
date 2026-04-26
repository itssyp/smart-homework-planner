import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
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
import TaskDetailPage from "./pages/TaskDetailPage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import StudySessionPage from "./pages/StudySessionPage";

const queryClient = new QueryClient();
const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "shp-react-query-cache",
});

const ProtectedDashboard = withAuthRedirect(Dashboard);
const ProtectedTasks = withAuthRedirect(TasksPage);
const ProtectedTaskDetail = withAuthRedirect(TaskDetailPage);
const ProtectedSubjects = withAuthRedirect(SubjectsPage);
const ProtectedSubjectDetail = withAuthRedirect(SubjectDetailPage);
const ProtectedStudyPlan = withAuthRedirect(StudyPlanPage);
const ProtectedStudySession = withAuthRedirect(StudySessionPage);

function App() {
  return (
    <>
      <ThemeProviderWrapper>
        <LanguageProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: queryPersister,
            maxAge: 1000 * 60 * 60 * 12,
          }}
        >
          <BrowserRouter>
            <AuthProvider>
              <Navigation>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<ProtectedDashboard />} />
                    <Route path="/tasks" element={<ProtectedTasks />} />
                    <Route path="/tasks/:taskId" element={<ProtectedTaskDetail />} />
                    <Route path="/subjects" element={<ProtectedSubjects />} />
                    <Route path="/subjects/:subjectId" element={<ProtectedSubjectDetail />} />
                    <Route path="/study-plan" element={<ProtectedStudyPlan />} />
                    <Route path="/study-session" element={<ProtectedStudySession />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
              </Navigation>
            </AuthProvider>
          </BrowserRouter>
        </PersistQueryClientProvider>
        </LanguageProvider>
      </ThemeProviderWrapper>
    </>
  );
}

export default App;
