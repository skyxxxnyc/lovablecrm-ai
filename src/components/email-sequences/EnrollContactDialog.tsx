import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface EnrollContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceId: string;
  sequenceName: string;
}

export const EnrollContactDialog = ({ 
  open, 
  onOpenChange, 
  sequenceId, 
  sequenceName 
}: EnrollContactDialogProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableContacts();
    }
  }, [open, sequenceId]);

  const fetchAvailableContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all contacts
    const { data: allContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email')
      .eq('user_id', user.id)
      .not('email', 'is', null);

    if (contactsError) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
      return;
    }

    // Get already enrolled contacts
    const { data: enrollments } = await supabase
      .from('sequence_enrollments')
      .select('contact_id')
      .eq('sequence_id', sequenceId)
      .in('status', ['active', 'paused']);

    const enrolledIds = new Set(enrollments?.map(e => e.contact_id) || []);
    
    // Filter out already enrolled contacts
    const available = allContacts?.filter(c => !enrolledIds.has(c.id)) || [];
    setContacts(available);
  };

  const handleToggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleEnroll = async () => {
    if (selectedContacts.size === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to enroll",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculate next send time (immediate for first email)
    const nextSendAt = new Date();
    nextSendAt.setMinutes(nextSendAt.getMinutes() + 1); // Send in 1 minute

    const enrollments = Array.from(selectedContacts).map(contactId => ({
      sequence_id: sequenceId,
      contact_id: contactId,
      user_id: user.id,
      status: 'active',
      current_step: 0,
      next_send_at: nextSendAt.toISOString(),
    }));

    const { error } = await supabase
      .from('sequence_enrollments')
      .insert(enrollments);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to enroll contacts",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${selectedContacts.size} contact(s) enrolled successfully`,
      });
      setSelectedContacts(new Set());
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Enroll Contacts - {sequenceName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No available contacts to enroll</p>
              <p className="text-sm mt-2">All contacts may already be enrolled or you have no contacts with email addresses</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>Select Contacts ({selectedContacts.size} selected)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedContacts.size === contacts.length) {
                      setSelectedContacts(new Set());
                    } else {
                      setSelectedContacts(new Set(contacts.map(c => c.id)));
                    }
                  }}
                >
                  {selectedContacts.size === contacts.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
                      onClick={() => handleToggleContact(contact.id)}
                    >
                      <Checkbox
                        checked={selectedContacts.has(contact.id)}
                        onCheckedChange={() => handleToggleContact(contact.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEnroll} 
              disabled={selectedContacts.size === 0 || loading}
            >
              Enroll {selectedContacts.size > 0 ? `(${selectedContacts.size})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
