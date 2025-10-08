import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ChatInterface from "@/components/ChatInterface";
import ContactDetailPanel from "@/components/ContactDetailPanel";
import DealDetailPanel from "@/components/DealDetailPanel";
import CompanyDetailPanel from "@/components/CompanyDetailPanel";
import Sidebar from "@/components/Sidebar";
import { Onboarding } from "@/components/Onboarding";
import { NotificationBell } from "@/components/NotificationBell";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, X } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'contacts' | 'deals' | 'companies' | 'tasks'>('chat');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Check onboarding status
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();
      
      if (!prefs || !prefs.onboarding_completed) {
        setShowOnboarding(true);
      }
      
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Onboarding 
        open={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
      
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar 
          onContactSelect={setSelectedContactId}
          onDealSelect={setSelectedDealId}
          onCompanySelect={setSelectedCompanyId}
          onViewChange={setCurrentView}
        />
        
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            {/* Top Bar with Notifications */}
            <div className="border-b border-border px-6 py-3 flex items-center justify-between">
              <h1 className="text-lg font-semibold">CRM Dashboard</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowActivityFeed(!showActivityFeed)}
                >
                  <Activity className="h-5 w-5" />
                </Button>
                <NotificationBell />
              </div>
            </div>
            
            <ChatInterface 
              user={user} 
              onContactCreated={(contactId) => setSelectedContactId(contactId)}
            />
          </div>
          
          {showActivityFeed && (
            <div className="w-96 border-l border-border relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={() => setShowActivityFeed(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <ActivityFeed />
            </div>
          )}
          
          {selectedContactId && (
            <ContactDetailPanel 
              contactId={selectedContactId}
              onClose={() => setSelectedContactId(null)}
            />
          )}
          
          {selectedDealId && (
            <DealDetailPanel 
              dealId={selectedDealId}
              onClose={() => setSelectedDealId(null)}
            />
          )}
          
          {selectedCompanyId && (
            <CompanyDetailPanel 
              companyId={selectedCompanyId}
              onClose={() => setSelectedCompanyId(null)}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
