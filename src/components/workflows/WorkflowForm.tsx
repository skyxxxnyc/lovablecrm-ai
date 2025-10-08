import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface WorkflowFormProps {
  workflow?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const WorkflowForm = ({ workflow, onSuccess, onCancel }: WorkflowFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "contact_created",
    actions: [{ type: "send_email", config: {} }]
  });
  const { toast } = useToast();

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || "",
        description: workflow.description || "",
        trigger_type: workflow.trigger_type || "contact_created",
        actions: workflow.actions || [{ type: "send_email", config: {} }]
      });
    }
  }, [workflow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      user_id: user.id,
    };

    const { error } = workflow
      ? await supabase.from('workflows').update(payload).eq('id', workflow.id)
      : await supabase.from('workflows').insert(payload);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${workflow ? 'update' : 'create'} workflow`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Workflow ${workflow ? 'updated' : 'created'} successfully`,
    });

    onSuccess();
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: "send_email", config: {} }]
    });
  };

  const removeAction = (index: number) => {
    const newActions = formData.actions.filter((_, i) => i !== index);
    setFormData({ ...formData, actions: newActions });
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...formData.actions];
    if (field === 'type') {
      newActions[index] = { type: value, config: {} };
    } else {
      newActions[index] = {
        ...newActions[index],
        config: { ...newActions[index].config, [field]: value }
      };
    }
    setFormData({ ...formData, actions: newActions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workflow Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Welcome New Contacts"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          placeholder="Describe what this workflow does..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trigger">Trigger *</Label>
        <Select 
          value={formData.trigger_type} 
          onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contact_created">Contact Created</SelectItem>
            <SelectItem value="deal_stage_changed">Deal Stage Changed</SelectItem>
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="manual">Manual Trigger</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Actions *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>

        {formData.actions.map((action, index) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Action {index + 1}</Label>
              {formData.actions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select
              value={action.type}
              onValueChange={(value) => updateAction(index, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="create_task">Create Task</SelectItem>
                <SelectItem value="update_field">Update Field</SelectItem>
                <SelectItem value="trigger_webhook">Trigger Webhook</SelectItem>
              </SelectContent>
            </Select>

            {action.type === 'send_email' && (
              <>
                <Input
                  placeholder="Email Template"
                  value={(action.config as any).template || ''}
                  onChange={(e) => updateAction(index, 'template', e.target.value)}
                />
                <Textarea
                  placeholder="Email content..."
                  value={(action.config as any).content || ''}
                  onChange={(e) => updateAction(index, 'content', e.target.value)}
                  rows={3}
                />
              </>
            )}

            {action.type === 'create_task' && (
              <>
                <Input
                  placeholder="Task Title"
                  value={(action.config as any).title || ''}
                  onChange={(e) => updateAction(index, 'title', e.target.value)}
                />
                <Select
                  value={(action.config as any).priority || 'medium'}
                  onValueChange={(value) => updateAction(index, 'priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {action.type === 'trigger_webhook' && (
              <Input
                placeholder="Webhook URL"
                value={(action.config as any).url || ''}
                onChange={(e) => updateAction(index, 'url', e.target.value)}
              />
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {workflow ? 'Update' : 'Create'} Workflow
        </Button>
      </div>
    </form>
  );
};
