import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open]);

  const fetchContacts = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .eq('user_id', session.session.user.id)
        .order('first_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const startDateTime = new Date(date);
      const [startHour, startMinute] = startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endDateTime = new Date(date);
      const [endHour, endMinute] = endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      const { error } = await supabase.functions.invoke('create-calendar-event', {
        body: {
          title,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: location || null,
          meeting_notes: notes || null,
          contact_ids: selectedContacts,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success('Event created successfully');
      onEventCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setLocation("");
    setNotes("");
    setSelectedContacts([]);
    setContactSearch("");
    onOpenChange(false);
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name} ${contact.email || ''}`
      .toLowerCase()
      .includes(contactSearch.toLowerCase())
  );

  const getSelectedContactNames = () => {
    return contacts
      .filter(c => selectedContacts.includes(c.id))
      .map(c => `${c.first_name} ${c.last_name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Calendar Event</DialogTitle>
          <DialogDescription>
            Schedule a new meeting or event
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time *</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Meeting location or video link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting agenda or notes"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Attendees</Label>
            <Input
              placeholder="Search contacts..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {getSelectedContactNames().map((name, idx) => (
                  <Badge key={idx} variant="secondary">
                    {name}
                    <button
                      type="button"
                      onClick={() => toggleContact(selectedContacts[idx])}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="max-h-32 overflow-y-auto border rounded-md">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                    selectedContacts.includes(contact.id) && "bg-accent"
                  )}
                >
                  <div className="text-sm font-medium">
                    {contact.first_name} {contact.last_name}
                  </div>
                  {contact.email && (
                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
