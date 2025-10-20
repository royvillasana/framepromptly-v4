import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { usePromptStore } from "@/stores/prompt-store";
import { useWorkflowStore } from "@/stores/workflow-store";
import Index from "./pages/Index";
import Workflow from "./pages/Workflow";
import Projects from "./pages/Projects";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeDocument from "./pages/KnowledgeDocument";
import { ProjectSettings } from "./components/project/project-settings";
import Library from "./pages/Library";
import PromptLibraryPage from "./components/prompt-library/prompt-library-page";
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
  // Initialize stores on app startup
  useEffect(() => {
    const { initializeEnhancedTemplates, initializeTemplates } = usePromptStore.getState();
    const { initializeFrameworks } = useWorkflowStore.getState();
    
    initializeEnhancedTemplates();
    initializeTemplates();
    initializeFrameworks();
    
    console.log('Enhanced template system initialized');
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        basename={import.meta.env.PROD ? '/framepromptly-v4' : '/'}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/knowledge/:projectId" element={<KnowledgeBase />} />
          <Route path="/knowledge/:projectId/document/:documentId" element={<KnowledgeDocument />} />
          <Route path="/project/:projectId/settings" element={<ProjectSettings />} />
          <Route path="/library-old" element={<Library />} />
          <Route path="/library" element={<PromptLibraryPage />} />
          <Route path="/library/:promptId" element={<PromptLibraryPage />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
