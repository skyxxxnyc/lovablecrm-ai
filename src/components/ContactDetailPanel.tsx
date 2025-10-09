import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactForm } from "./forms/ContactForm";
import { ActivityForm } from "./forms/ActivityForm";
import { InlineEditField } from "./detail-panels/InlineEditField";
import { ActivityHistory } from "./detail-panels/ActivityHistory";
import { FileAttachment } from "./FileAttachment";
import { RelatedRecords } from "./detail-panels/RelatedRecords";
import { QuickActions } from "./detail-panels/QuickActions";
import { 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Edit,
  Trash2,
  Activity,
  Paperclip,
  Network
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

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

const ContactDetailPanel = ({ contactId, onClose }: ContactDetailPanelProps) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactDetails();
  }, [contactId]);

  const fetchContactDetails = async () => {
    setLoading(true);
    
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

    const { data: attachmentData } = await supabase
      .from('attachments')
      .select('*')
      .eq('entity_type', 'contact')
      .eq('entity_id', contactId)
      .order('created_at', { ascending: false });

    setAttachments(attachmentData || []);
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

  const handleFieldSave = async (field: string, value: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ [field]: value })
      .eq('id', contactId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Saved",
      description: `${field} updated successfully`,
    });

    if (contact) {
      setContact({ ...contact, [field]: value });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "email":
        if (contact?.email) {
          window.location.href = `mailto:${contact.email}`;
        }
        break;
      case "call":
      case "meeting":
      case "note":
      case "task":
        setShowActivityDialog(true);
        break;
    }
  };

  if (loading || !contact) {
    return (
      <aside className="w-96 border-l border-border bg-card flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="fixed md:relative inset-0 md:inset-auto md:w-96 border-l border-border bg-card flex flex-col h-screen animate-slide-in-right z-40 md:z-auto">
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">
              {contact.first_name} {contact.last_name}
            </h2>
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

        <div className="space-y-2 mb-4">
          <InlineEditField
            value={contact.email}
            onSave={(value) => handleFieldSave("email", value)}
            type="email"
            placeholder="Add email"
            prefix={<Mail className="h-4 w-4 text-muted-foreground" />}
          />
          
          <InlineEditField
            value={contact.phone}
            onSave={(value) => handleFieldSave("phone", value)}
            type="tel"
            placeholder="Add phone"
            prefix={<Phone className="h-4 w-4 text-muted-foreground" />}
          />

          <InlineEditField
            value={contact.position}
            onSave={(value) => handleFieldSave("position", value)}
            placeholder="Add position"
            prefix={<Building2 className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <QuickActions
          entityType="contact"
          entityId={contactId}
          onAction={handleQuickAction}
        />
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-6 space-y-6 m-0">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Attachments ({attachments.length})</h3>
              </div>
              <FileAttachment
                entityType="contact"
                entityId={contactId}
                attachments={attachments}
                onUploadComplete={fetchContactDetails}
              />
            </div>

            {contact.notes && (
              <div>
                <h3 className="font-semibold mb-3">Notes</h3>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="p-6 m-0">
            <ActivityHistory entityType="contact" entityId={contactId} />
          </TabsContent>

          <TabsContent value="related" className="p-6 m-0">
            <RelatedRecords entityType="contact" entityId={contactId} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

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
