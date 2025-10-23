import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TaskFormProps {
  taskId?: string;
  contactId?: string;
  dealId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Deal {
  id: string;
  title: string;
}

export const TaskForm = ({ taskId, contactId, dealId, onSuccess, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    contact_id: contactId || "",
    deal_id: dealId || "",
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatedData();
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchRelatedData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [contactsRes, dealsRes] = await Promise.all([
      supabase.from("contacts").select("id, first_name, last_name").eq("user_id", user.id),
      supabase.from("deals").select("id, title").eq("user_id", user.id),
    ]);

    if (contactsRes.data) setContacts(contactsRes.data);
    if (dealsRes.data) setDeals(dealsRes.data);
  };

  const fetchTask = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load task details",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      title: data.title || "",
      description: data.description || "",
      status: data.status || "pending",
      priority: data.priority || "medium",
      due_date: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : "",
      contact_id: data.contact_id || "",
      deal_id: data.deal_id || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const taskData = {
      ...formData,
      user_id: user.id,
      contact_id: formData.contact_id || null,
      deal_id: formData.deal_id || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    };

    let error;
    if (taskId) {
      const result = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", taskId);
      error = result.error;
    } else {
      const result = await supabase
        .from("tasks")
        .insert(taskData);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${taskId ? "update" : "create"} task`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Task ${taskId ? "updated" : "created"} successfully`,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Follow up with client"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Task details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Contact (Optional)</Label>
        <Select value={formData.contact_id} onValueChange={(value) => setFormData({ ...formData, contact_id: value })}>
          <SelectTrigger id="contact">
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
        <Label htmlFor="deal">Deal (Optional)</Label>
        <Select value={formData.deal_id} onValueChange={(value) => setFormData({ ...formData, deal_id: value })}>
          <SelectTrigger id="deal">
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : taskId ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
};
