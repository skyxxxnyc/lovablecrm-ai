import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewItemDialog } from "./NewItemDialog";
import { 
  Sparkles, 
  Search, 
  Users, 
  Building2, 
  Briefcase, 
  CheckSquare, 
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  Mail,
  Calendar,
  BookOpen,
  Settings,
  Moon,
  Sun,
  TrendingUp,
  BarChart3,
  FileText
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  onContactSelect: (contactId: string) => void;
  onDealSelect: (dealId: string) => void;
  onCompanySelect: (companyId: string) => void;
  onViewChange: (view: 'chat' | 'contacts' | 'deals' | 'companies' | 'tasks') => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  position: string | null;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number | null;
}

interface Company {
  id: string;
  name: string;
  industry: string | null;
}

const Sidebar = ({ onContactSelect, onDealSelect, onCompanySelect, onViewChange }: SidebarProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeView, setActiveView] = useState<'chat' | 'contacts' | 'deals' | 'companies' | 'tasks'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchContacts();
    fetchDeals();
    fetchCompanies();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching contacts:', error);
      return;
    }

    setContacts(data || []);
  };

  const fetchDeals = async () => {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching deals:', error);
      return;
    }

    setDeals(data || []);
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching companies:', error);
      return;
    }

    setCompanies(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    });
    navigate("/auth");
  };

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(view);
    onViewChange(view);
  };

  const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) => (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon"
            className="w-10 h-10 rounded-lg hover:bg-secondary"
            onClick={onClick}
          >
            <Icon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <aside className={`${isExpanded ? 'w-64' : 'w-16'} border-r border-border bg-card flex flex-col h-screen transition-all duration-300`}>
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-center">
        <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-background" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <NavButton icon={Plus} label="New" onClick={() => setShowNewDialog(true)} />
        <NavButton icon={Search} label="Search" />
        <div className="pt-2 border-t border-border" />
        <NavButton 
          icon={Sparkles} 
          label="AI Chat" 
          active={activeView === 'chat'}
          onClick={() => handleViewChange('chat')} 
        />
        <NavButton 
          icon={Users} 
          label="Contacts" 
          active={activeView === 'contacts'}
          onClick={() => handleViewChange('contacts')} 
        />
        <NavButton 
          icon={Building2} 
          label="Companies" 
          active={activeView === 'companies'}
          onClick={() => handleViewChange('companies')} 
        />
        <NavButton 
          icon={Briefcase} 
          label="Deals" 
          active={activeView === 'deals'}
          onClick={() => handleViewChange('deals')} 
        />
        <NavButton 
          icon={CheckSquare} 
          label="Tasks" 
          active={activeView === 'tasks'}
          onClick={() => handleViewChange('tasks')} 
        />
        <div className="pt-2 border-t border-border" />
        <NavButton 
          icon={TrendingUp} 
          label="Pipeline" 
          onClick={() => navigate('/pipeline')} 
        />
        <NavButton 
          icon={FileText} 
          label="Reports" 
          onClick={() => navigate('/reports')} 
        />
        <NavButton 
          icon={BarChart3} 
          label="Analytics" 
          onClick={() => navigate('/analytics')} 
        />
        <NavButton 
          icon={Zap} 
          label="Workflows" 
          onClick={() => navigate('/workflows')} 
        />
        <NavButton 
          icon={Settings} 
          label="Automation Rules" 
          onClick={() => navigate('/automation')} 
        />
        <NavButton 
          icon={Mail} 
          label="Email Sequences" 
          onClick={() => navigate('/sequences')} 
        />
        <NavButton 
          icon={Calendar} 
          label="Scheduling" 
          onClick={() => navigate('/scheduling')} 
        />
        <NavButton 
          icon={BookOpen} 
          label="Prompt Library" 
          onClick={() => navigate('/prompts')} 
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <NavButton 
          icon={isExpanded ? ChevronLeft : ChevronRight} 
          label={isExpanded ? 'Collapse' : 'Expand'}
          onClick={() => setIsExpanded(!isExpanded)} 
        />
        <NavButton 
          icon={theme === 'dark' ? Sun : Moon} 
          label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        />
        <NavButton icon={LogOut} label="Sign out" onClick={handleSignOut} />
      </div>


      <NewItemDialog 
        open={showNewDialog} 
        onOpenChange={setShowNewDialog}
        onSuccess={() => {
          fetchContacts();
          fetchDeals();
          fetchCompanies();
        }}
      />
    </aside>
  );
};

export default Sidebar;
