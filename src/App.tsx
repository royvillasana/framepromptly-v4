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
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import MetricsDashboard from "./pages/MetricsDashboard";
import Frameworks from "./pages/Frameworks";
import TestInstructions from "./pages/TestInstructions";
import ToolPromptDemo from "./pages/ToolPromptDemo";
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
          <Route path="/library" element={<Library />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/metrics" element={<MetricsDashboard />} />
          <Route path="/frameworks" element={<Frameworks />} />
          <Route path="/test-instructions" element={<TestInstructions />} />
          <Route path="/tool-prompt-demo" element={<ToolPromptDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
