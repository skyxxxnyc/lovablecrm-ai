import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ContactFormProps {
  contactId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Company {
  id: string;
  name: string;
}

export const ContactForm = ({ contactId, onSuccess, onCancel }: ContactFormProps) => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    company_id: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name')
      .order('name');
    setCompanies(data || []);
  };

  const fetchContact = async () => {
    if (!contactId) return;
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load contact",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      phone: data.phone || "",
      position: data.position || "",
      company_id: data.company_id || "",
      notes: data.notes || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      company_id: formData.company_id || null,
      user_id: user.id,
    };

    const { data, error } = contactId
      ? await supabase.from('contacts').update(payload).eq('id', contactId).select()
      : await supabase.from('contacts').insert(payload).select();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${contactId ? 'update' : 'create'} contact`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Contact ${contactId ? 'updated' : 'created'} successfully`,
    });

    // Trigger workflows for contact creation
    if (!contactId && data && data[0]) {
      try {
        const { data: workflows } = await supabase
          .from('workflows')
          .select('id')
          .eq('trigger_type', 'contact_created')
          .eq('is_active', true);

        if (workflows && workflows.length > 0) {
          for (const workflow of workflows) {
            await supabase.functions.invoke('execute-workflow', {
              body: {
                workflowId: workflow.id,
                triggerData: { contact_id: data[0].id, email: data[0].email }
              }
            });
          }
        }
      } catch (err) {
        console.error('Error triggering workflows:', err);
      }
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {contactId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
