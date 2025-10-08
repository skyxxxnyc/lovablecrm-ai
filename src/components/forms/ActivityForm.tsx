import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ActivityFormProps {
  contactId?: string;
  dealId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ActivityForm = ({ contactId, dealId, onSuccess, onCancel }: ActivityFormProps) => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    activity_type: "call",
    subject: "",
    description: "",
    activity_date: new Date().toISOString().split('T')[0],
    contact_id: contactId || "",
    deal_id: dealId || "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    const [contactsRes, dealsRes] = await Promise.all([
      supabase.from('contacts').select('id, first_name, last_name').order('first_name'),
      supabase.from('deals').select('id, title').order('title')
    ]);
    setContacts(contactsRes.data || []);
    setDeals(dealsRes.data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      activity_type: formData.activity_type,
      subject: formData.subject,
      description: formData.description || null,
      activity_date: formData.activity_date,
      contact_id: formData.contact_id || null,
      deal_id: formData.deal_id || null,
      user_id: user.id,
    };

    const { error } = await supabase.from('activities').insert(payload);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to log activity",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Activity logged successfully",
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activity_type">Activity Type *</Label>
        <Select value={formData.activity_type} onValueChange={(value) => setFormData({ ...formData, activity_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity_date">Date *</Label>
        <Input
          id="activity_date"
          type="date"
          value={formData.activity_date}
          onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Select value={formData.contact_id} onValueChange={(value) => setFormData({ ...formData, contact_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal">Deal</Label>
        <Select value={formData.deal_id} onValueChange={(value) => setFormData({ ...formData, deal_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select deal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log Activity
        </Button>
      </div>
    </form>
  );
};
