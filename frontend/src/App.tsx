import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProviderWrapper } from "./context/ThemeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./authentication/AuthProvider";
import ErrorPage from "./pages/ErrorPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { LanguageProvider } from "./context/LanguageProvider";
import Navigation from "./layout/Navigation";


const queryClient = new QueryClient();

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
