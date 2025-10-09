import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workflows from "./pages/Workflows";
import Integrations from "./pages/Integrations";
import EmailSequences from "./pages/EmailSequences";
import Scheduling from "./pages/Scheduling";
import BookMeeting from "./pages/BookMeeting";
import PromptLibrary from "./pages/PromptLibrary";
import AutomationRules from "./pages/AutomationRules";
import Pipeline from "./pages/Pipeline";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import EmailHub from "./pages/EmailHub";
import CustomFields from "./pages/CustomFields";
import NotFound from "./pages/NotFound";
import { FloatingChatButton } from "./components/FloatingChatButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/sequences" element={<EmailSequences />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/prompts" element={<PromptLibrary />} />
          <Route path="/automation" element={<AutomationRules />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/email-hub" element={<EmailHub />} />
          <Route path="/custom-fields" element={<CustomFields />} />
          <Route path="/book/:slug" element={<BookMeeting />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingChatButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
