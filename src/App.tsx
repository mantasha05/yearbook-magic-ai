import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import UploadPage from "./pages/UploadPage";
import TemplatesPage from "./pages/TemplatesPage";
import SectionBuilder from "./pages/SectionBuilder";
import SectionEditor from "./pages/SectionEditor";
import GeneratePage from "./pages/GeneratePage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
            <Route path="/sections" element={<ProtectedRoute><SectionBuilder /></ProtectedRoute>} />
            <Route path="/sections/:sectionId" element={<ProtectedRoute><SectionEditor /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
