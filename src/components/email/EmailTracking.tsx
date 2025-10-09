import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Eye, MousePointerClick, Reply } from "lucide-react";
import { toast } from "sonner";

export const EmailTracking = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_tracking')
        .select('*, contacts(first_name, last_name)')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-success text-success-foreground';
      case 'clicked': return 'bg-primary text-primary-foreground';
      case 'opened': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading emails...</div>;
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No emails sent yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Card key={email.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{email.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  To: {email.contacts?.first_name} {email.contacts?.last_name}
                </p>
              </div>
              <Badge className={getStatusColor(email.status)}>
                {email.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Sent {new Date(email.sent_at).toLocaleDateString()}
              </div>
              {email.opened_at && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Opened
                </div>
              )}
              {email.clicked_at && (
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  Clicked
                </div>
              )}
              {email.replied_at && (
                <div className="flex items-center gap-1">
                  <Reply className="h-3 w-3" />
                  Replied
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
