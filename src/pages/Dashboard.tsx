import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ChatInterface from "@/components/ChatInterface";
import ContactDetailPanel from "@/components/ContactDetailPanel";
import Sidebar from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onContactSelect={setSelectedContactId} />
      
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatInterface 
            user={user} 
            onContactCreated={(contactId) => setSelectedContactId(contactId)}
          />
        </div>
        
        {selectedContactId && (
          <ContactDetailPanel 
            contactId={selectedContactId}
            onClose={() => setSelectedContactId(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
