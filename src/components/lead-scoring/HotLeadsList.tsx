import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HotLead {
  id: string;
  contact_id: string;
  score: number;
  signals: any;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    position: string;
  };
}

export const HotLeadsList = () => {
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotLeads();
  }, []);

  const fetchHotLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_scores')
        .select(`
          *,
          contacts:contact_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            position
          )
        `)
        .gte('score', 70)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHotLeads(data || []);
    } catch (error) {
      console.error('Error fetching hot leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hot Leads 🔥</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (hotLeads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hot Leads 🔥</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hot leads yet. Keep engaging with your contacts to increase their scores!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hot Leads 🔥</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hotLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {lead.contacts.first_name} {lead.contacts.last_name}
                  </p>
                  {lead.contacts.position && (
                    <p className="text-xs text-muted-foreground truncate">{lead.contacts.position}</p>
                  )}
                </div>
                <LeadScoreBadge score={lead.score} signals={lead.signals} size="sm" />
              </div>
              <div className="flex items-center gap-1 ml-2">
                {lead.contacts.phone && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => window.open(`tel:${lead.contacts.phone}`)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                {lead.contacts.email && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => window.open(`mailto:${lead.contacts.email}`)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/?contact=${lead.contacts.id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
