import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Search, 
  Users, 
  Building2, 
  Briefcase, 
  CheckSquare, 
  LogOut,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[var(--sidebar-width)] border-r border-border bg-card flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CRM AI
          </h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2 space-y-1">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Contacts
        </Button>
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Building2 className="mr-2 h-4 w-4" />
          Companies
        </Button>
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Briefcase className="mr-2 h-4 w-4" />
          Deals
        </Button>
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <CheckSquare className="mr-2 h-4 w-4" />
          Tasks
        </Button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-hidden flex flex-col px-2">
        <div className="flex items-center justify-between py-2 px-2">
          <span className="text-sm font-medium text-muted-foreground">Recent Contacts</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 pb-4">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onContactSelect(contact.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                    {contact.first_name[0]}{contact.last_name[0]}
                  </div>
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
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
