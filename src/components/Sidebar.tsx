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
  Zap
} from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    if (!isExpanded) setIsExpanded(true);
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
    <aside className={`${isExpanded ? 'w-[var(--sidebar-width-expanded)]' : 'w-[var(--sidebar-width)]'} border-r border-border bg-card flex flex-col h-screen transition-all duration-300 relative`}>
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-center">
        <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-background" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="p-3 space-y-2">
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
          icon={Zap} 
          label="Workflows" 
          onClick={() => navigate('/workflows')} 
        />
      </div>

      {/* Expanded List View */}
      {isExpanded && activeView !== 'chat' && (
        <div className="flex-1 border-l border-border overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-4 capitalize">{activeView}</h3>
              <div className="space-y-1">
                {activeView === 'contacts' && contacts.map((contact) => (
                  <Button
                    key={contact.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      onContactSelect(contact.id);
                      setActiveView('chat');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.position && (
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.position}
                        </p>
                      )}
                    </div>
                  </Button>
                ))}
                
                {activeView === 'deals' && deals.map((deal) => (
                  <Button
                    key={deal.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      onDealSelect(deal.id);
                      setActiveView('chat');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.title}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{deal.stage}</p>
                        {deal.amount && (
                          <p className="text-xs font-semibold">${deal.amount.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
                
                {activeView === 'companies' && companies.map((company) => (
                  <Button
                    key={company.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      onCompanySelect(company.id);
                      setActiveView('chat');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{company.name}</p>
                      {company.industry && (
                        <p className="text-xs text-muted-foreground truncate">
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <NavButton icon={LogOut} label="Sign out" onClick={handleSignOut} />
      </div>

      {/* Expand/Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {isExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

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
