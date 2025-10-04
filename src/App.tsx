import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePromptStore } from "@/stores/prompt-store";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TitleBar } from "@/components/TitleBar";
import Index from "./pages/Index";
import Workflow from "./pages/Workflow";
import Projects from "./pages/Projects";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeDocument from "./pages/KnowledgeDocument";
import { ProjectSettings } from "./components/project/project-settings";
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import MetricsDashboard from "./pages/MetricsDashboard";
import Frameworks from "./pages/Frameworks";
import TestInstructions from "./pages/TestInstructions";
import ToolPromptDemo from "./pages/ToolPromptDemo";
import AIStressTest from "./pages/AIStressTest";
import Board from "./pages/Board";
import Profile from "./pages/Profile";
import Invitation from "./pages/Invitation";
import PromptBuilder from "./pages/PromptBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Initialize stores on app startup
  useEffect(() => {
    const { initializeEnhancedTemplates, initializeTemplates } = usePromptStore.getState();
    const { initializeFrameworks } = useWorkflowStore.getState();

    initializeEnhancedTemplates();
    initializeTemplates();
    initializeFrameworks();

    console.log('Enhanced template system initialized');
  }, []);

  // Handle loading screen completion
  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Show loading screen on initial app load
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Show TitleBar only in Electron */}
      {window.electron && <TitleBar />}
      <Toaster />
      <Sonner />
      <HashRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              authLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              ) : user ? (
                <Navigate to="/projects" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/knowledge/:projectId" element={<KnowledgeBase />} />
          <Route path="/knowledge/:projectId/document/:documentId" element={<KnowledgeDocument />} />
          <Route path="/project/:projectId/settings" element={<ProjectSettings />} />
          <Route path="/library" element={<Library />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/metrics" element={<MetricsDashboard />} />
          <Route path="/frameworks" element={<Frameworks />} />
          <Route path="/test-instructions" element={<TestInstructions />} />
          <Route path="/tool-prompt-demo" element={<ToolPromptDemo />} />
          <Route path="/aistresstest" element={<AIStressTest />} />
          <Route path="/board" element={<Board />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="/prompt-builder" element={<PromptBuilder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
