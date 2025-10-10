import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ChatInterface from "@/components/ChatInterface";
import ContactDetailPanel from "@/components/ContactDetailPanel";
import DealDetailPanel from "@/components/DealDetailPanel";
import CompanyDetailPanel from "@/components/CompanyDetailPanel";
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";
import MobileFAB from "@/components/mobile/MobileFAB";
import { Onboarding } from "@/components/Onboarding";
import { NotificationBell } from "@/components/NotificationBell";
import { ActivityFeed } from "@/components/ActivityFeed";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { HotLeadsList } from "@/components/lead-scoring/HotLeadsList";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { CalendarView } from "@/components/calendar/CalendarView";
import { NewItemDialog } from "@/components/NewItemDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Activity, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'contacts' | 'deals' | 'companies' | 'tasks'>('chat');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const { isOpen: searchOpen, setIsOpen: setSearchOpen } = useGlobalSearch();
  const isMobile = useIsMobile();
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
      
      <ResponsiveLayout
        onViewChange={(view) => setCurrentView(view as 'chat' | 'contacts' | 'deals' | 'companies' | 'tasks')}
        onContactSelect={setSelectedContactId}
        onDealSelect={setSelectedDealId}
        onCompanySelect={setSelectedCompanyId}
      >
        <div className="flex flex-1 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar with Tabs and Notifications */}
              <div className="border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
                <TabsList className={isMobile ? "scale-90" : ""}>
                  <TabsTrigger value="chat" className={isMobile ? "text-xs px-2" : ""}>
                    {isMobile ? "Chat" : "AI Chat"}
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className={isMobile ? "text-xs px-2" : ""}>
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className={isMobile ? "text-xs px-2" : ""}>
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="activity" className={isMobile ? "text-xs px-2" : ""}>
                    Activity
                  </TabsTrigger>
                </TabsList>
                
                {!isMobile && (
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
                )}
              </div>
              
              <TabsContent value="chat" className="flex-1 overflow-auto m-0">
                <ChatInterface 
                  user={user} 
                  onContactCreated={(contactId) => setSelectedContactId(contactId)}
                  onContactSelect={(contactId) => setSelectedContactId(contactId)}
                  onDealSelect={(dealId) => setSelectedDealId(dealId)}
                  onCompanySelect={(companyId) => setSelectedCompanyId(companyId)}
                />
              </TabsContent>
              
              <TabsContent value="metrics" className="flex-1 overflow-auto p-4 md:p-6 m-0">
                <div className="space-y-6">
                  <DashboardMetrics />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <DashboardCharts />
                    </div>
                    <div>
                      <HotLeadsList />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar" className="flex-1 overflow-auto p-4 md:p-6 m-0">
                <CalendarView />
              </TabsContent>
              
              <TabsContent value="activity" className="flex-1 overflow-auto p-4 md:p-6 m-0">
                <ActivityTimeline />
              </TabsContent>
            </Tabs>
          </div>
          
          {!isMobile && showActivityFeed && (
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
        </div>
      </ResponsiveLayout>
      
      {/* Mobile FAB for quick actions */}
      <MobileFAB
        onNewContact={() => setShowNewDialog(true)}
        onNewDeal={() => setShowNewDialog(true)}
        onNewCompany={() => setShowNewDialog(true)}
        onNewEvent={() => navigate('/scheduling')}
      />
      
      <NewItemDialog 
        open={showNewDialog} 
        onOpenChange={setShowNewDialog}
      />
      
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Dashboard;
