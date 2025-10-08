import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactForm } from "./forms/ContactForm";
import { ActivityForm } from "./forms/ActivityForm";
import { 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Edit,
  Trash2,
  Send,
  FileText,
  MessageSquare,
  ExternalLink,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactDetailPanelProps {
  contactId: string;
  onClose: () => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  notes: string | null;
  company_id: string | null;
  companies?: {
    name: string;
  };
}

interface Email {
  id: string;
  subject: string;
  body: string;
  sent_at: string;
  is_outbound: boolean;
  from_email: string;
  to_email: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_notes: string | null;
}

interface ActivityLog {
  id: string;
  activity_type: string;
  subject: string;
  description: string | null;
  activity_date: string;
}

const ContactDetailPanel = ({ contactId, onClose }: ContactDetailPanelProps) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [meetings, setMeetings] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactDetails();
  }, [contactId]);

  const fetchContactDetails = async () => {
    setLoading(true);
    
    // Fetch contact
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*, companies(name)')
      .eq('id', contactId)
      .single();

    if (contactError) {
      console.error('Error fetching contact:', contactError);
      toast({
        title: "Error",
        description: "Failed to load contact details",
        variant: "destructive",
      });
      return;
    }

    setContact(contactData);

    // Fetch emails
    const { data: emailData } = await supabase
      .from('emails')
      .select('*')
      .eq('contact_id', contactId)
      .order('sent_at', { ascending: false })
      .limit(10);

    setEmails(emailData || []);

    // Fetch meetings
    const { data: meetingData } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('start_time', { ascending: false })
      .limit(10);

    setMeetings(meetingData || []);

    // Fetch activities
    const { data: activityData } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('activity_date', { ascending: false })
      .limit(10);

    setActivities(activityData || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Contact deleted successfully",
    });
    
    onClose();
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const { error } = await supabase
      .from('contacts')
      .update({ notes: newNote })
      .eq('id', contactId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Note saved successfully",
    });
    
    if (contact) {
      setContact({ ...contact, notes: newNote });
    }
    setNewNote("");
  };

  if (loading || !contact) {
    return (
      <aside className="w-96 border-l border-border bg-card flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-l border-border bg-card flex flex-col h-screen animate-slide-in-right">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-semibold">
                {contact.first_name} {contact.last_name}
              </h2>
              <Badge variant="secondary" className="text-xs">
                0
              </Badge>
            </div>
            {contact.position && (
              <p className="text-sm text-muted-foreground">{contact.position}</p>
            )}
            {contact.companies && (
              <p className="text-sm text-muted-foreground">{contact.companies.name}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {contact.email && (
          <div className="flex items-center space-x-2 text-sm mb-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{contact.email}</span>
          </div>
        )}

        <div className="flex space-x-2 mt-4">
          <Button className="flex-1" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowActivityDialog(true)}>
            <Activity className="mr-2 h-4 w-4" />
            Log Activity
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Email History */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Email History</h3>
            </div>
            {emails.length === 0 ? (
              <Card className="p-8 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No email history yet</p>
                <p className="text-xs text-muted-foreground">
                  Connect Gmail to see conversations
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <Card key={email.id} className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium">{email.subject}</p>
                      <Badge variant={email.is_outbound ? "default" : "secondary"} className="text-xs">
                        {email.is_outbound ? "Sent" : "Received"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{email.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(email.sent_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Meeting History */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Meeting History</h3>
            </div>
            {meetings.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No meetings yet</p>
                <p className="text-xs text-muted-foreground">
                  Meetings will auto-log from Google Calendar
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} className="p-3">
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(meeting.start_time).toLocaleString()}
                    </p>
                    {meeting.meeting_notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {meeting.meeting_notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Activities</h3>
            </div>
            {activities.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activities logged</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      <Badge variant="secondary" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.activity_date).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Notes</h3>
            </div>
            {contact.notes && (
              <Card className="p-3 mb-3 bg-secondary/50">
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </Card>
            )}
            <Card className="p-3">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] mb-2 border-0 p-0 focus-visible:ring-0 shadow-none resize-none"
              />
              <Button 
                onClick={handleSaveNote}
                size="sm" 
                className="w-full"
                disabled={!newNote.trim()}
              >
                <Send className="mr-2 h-3 w-3" />
                Save Note
              </Button>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            contactId={contactId}
            onSuccess={() => {
              setShowEditDialog(false);
              fetchContactDetails();
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            contactId={contactId}
            onSuccess={() => {
              setShowActivityDialog(false);
              fetchContactDetails();
            }}
            onCancel={() => setShowActivityDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default ContactDetailPanel;
