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
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import EmailHub from "./pages/EmailHub";
import CustomFields from "./pages/CustomFields";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Contacts from "./pages/Contacts";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import DealDetail from "./pages/DealDetail";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import BlogAdmin from "./pages/BlogAdmin";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import ConversionLanding from "./pages/ConversionLanding";
import { FloatingChatButton } from "./components/FloatingChatButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <main id="main-content" role="main">
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
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/email-hub" element={<EmailHub />} />
            <Route path="/custom-fields" element={<CustomFields />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:id" element={<DealDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/blog-admin" element={<BlogAdmin />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/book/:slug" element={<BookMeeting />} />
            <Route path="/landing" element={<ConversionLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <FloatingChatButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
