import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  onContactSelect: (contactId: string) => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  position: string | null;
}

const Sidebar = ({ onContactSelect }: SidebarProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();

    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    });
    navigate("/auth");
  };

  const NavButton = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
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
      <div className="p-3 space-y-2 flex-1">
        <NavButton icon={Plus} label="New" />
        <NavButton icon={Search} label="Search" />
        <NavButton icon={Users} label="Contacts" />
        <NavButton icon={Building2} label="Companies" />
        <NavButton icon={Briefcase} label="Deals" />
        <NavButton icon={CheckSquare} label="Tasks" />
      </div>

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
    </aside>
  );
};

export default Sidebar;
