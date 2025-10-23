import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DealFormProps {
  dealId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DealForm = ({ dealId, onSuccess, onCancel }: DealFormProps) => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    stage: "lead",
    amount: "",
    probability: "0",
    expected_close_date: "",
    contact_id: "",
    company_id: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatedData();
    if (dealId) {
      fetchDeal();
    }
  }, [dealId]);

  const fetchRelatedData = async () => {
    const [contactsRes, companiesRes] = await Promise.all([
      supabase.from('contacts').select('id, first_name, last_name').order('first_name'),
      supabase.from('companies').select('id, name').order('name')
    ]);
    setContacts(contactsRes.data || []);
    setCompanies(companiesRes.data || []);
  };

  const fetchDeal = async () => {
    if (!dealId) return;
    
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (error) return;

    setFormData({
      title: data.title || "",
      stage: data.stage || "lead",
      amount: data.amount?.toString() || "",
      probability: data.probability?.toString() || "0",
      expected_close_date: data.expected_close_date || "",
      contact_id: data.contact_id || "",
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
      title: formData.title,
      stage: formData.stage,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      probability: parseInt(formData.probability),
      expected_close_date: formData.expected_close_date || null,
      contact_id: formData.contact_id && formData.contact_id !== 'none' ? formData.contact_id : null,
      company_id: formData.company_id && formData.company_id !== 'none' ? formData.company_id : null,
      notes: formData.notes || null,
      user_id: user.id,
    };

    // Check if stage changed for existing deal
    let stageChanged = false;
    if (dealId) {
      const { data: existingDeal } = await supabase
        .from('deals')
        .select('stage')
        .eq('id', dealId)
        .single();
      
      stageChanged = existingDeal && existingDeal.stage !== formData.stage;
    }

    const { data, error } = dealId
      ? await supabase.from('deals').update(payload).eq('id', dealId).select()
      : await supabase.from('deals').insert(payload).select();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${dealId ? 'update' : 'create'} deal`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Deal ${dealId ? 'updated' : 'created'} successfully`,
    });

    // Trigger workflows
    if (data && data[0]) {
      try {
        const triggerType = stageChanged ? 'deal_stage_changed' : 'contact_created';
        const { data: workflows } = await supabase
          .from('workflows')
          .select('id')
          .eq('trigger_type', triggerType)
          .eq('is_active', true);

        if (workflows && workflows.length > 0) {
          for (const workflow of workflows) {
            await supabase.functions.invoke('execute-workflow', {
              body: {
                workflowId: workflow.id,
                triggerData: { 
                  deal_id: data[0].id,
                  stage: data[0].stage,
                  amount: data[0].amount
                }
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
      <div className="space-y-2">
        <Label htmlFor="title">Deal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_close_date">Expected Close</Label>
          <Input
            id="expected_close_date"
            type="date"
            value={formData.expected_close_date}
            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Select value={formData.contact_id} onValueChange={(value) => setFormData({ ...formData, contact_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
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
          {dealId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
