import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus, Trash2, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  action_type: string;
  action_config: any;
  is_active: boolean;
}

const AutomationRules = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    trigger_type: string;
    trigger_config: any;
    action_type: string;
    action_config: any;
  }>({
    name: '',
    description: '',
    trigger_type: 'meeting_scheduled',
    trigger_config: { days_delay: 3 },
    action_type: 'create_task',
    action_config: { title: 'Follow up', priority: 'medium' }
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchRules();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load automation rules",
        variant: "destructive",
      });
    } else {
      setRules(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('automation_rules')
      .insert({
        user_id: user.id,
        ...formData,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create rule",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Automation rule created",
      });
      setShowDialog(false);
      fetchRules();
    }
  };

  const handleToggleActive = async (rule: AutomationRule) => {
    const { error } = await supabase
      .from('automation_rules')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update rule",
        variant: "destructive",
      });
    } else {
      fetchRules();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this automation rule?')) return;

    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    } else {
      fetchRules();
    }
  };

  const getTriggerDescription = (rule: AutomationRule) => {
    switch (rule.trigger_type) {
      case 'meeting_scheduled':
        return `${rule.trigger_config.days_delay} days after meeting`;
      case 'deal_stage_changed':
        return `When deal moves to ${rule.trigger_config.stage}`;
      case 'contact_inactive':
        return `${rule.trigger_config.days_inactive} days of inactivity`;
      default:
        return rule.trigger_type;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Automation Rules</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Automation Rules</h1>
            <p className="text-muted-foreground">
              Automatically create follow-up tasks based on triggers
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </div>

        <div className="grid gap-4">
          {rules.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No automation rules yet</p>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3">
                        <Zap className="h-5 w-5" />
                        {rule.name}
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{rule.description}</CardDescription>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Trigger:</strong> {getTriggerDescription(rule)}</p>
                        <p><strong>Action:</strong> Create task "{rule.action_config.title}" ({rule.action_config.priority} priority)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleActive(rule)}
                      >
                        {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Follow up after meeting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this rule do?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trigger_type">Trigger</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => {
                  let config = {};
                  if (value === 'meeting_scheduled') config = { days_delay: 3 };
                  if (value === 'deal_stage_changed') config = { stage: 'negotiation' };
                  if (value === 'contact_inactive') config = { days_inactive: 30 };
                  setFormData({ ...formData, trigger_type: value, trigger_config: config });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting_scheduled">After Meeting Scheduled</SelectItem>
                  <SelectItem value="deal_stage_changed">Deal Stage Changed</SelectItem>
                  <SelectItem value="contact_inactive">Contact Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.trigger_type === 'meeting_scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="days_delay">Days After Meeting</Label>
                <Input
                  id="days_delay"
                  type="number"
                  min="1"
                  value={formData.trigger_config.days_delay}
                  onChange={(e) => setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, days_delay: parseInt(e.target.value) }
                  })}
                />
              </div>
            )}

            {formData.trigger_type === 'deal_stage_changed' && (
              <div className="space-y-2">
                <Label htmlFor="stage">Deal Stage</Label>
                <Select
                  value={formData.trigger_config.stage}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, stage: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.trigger_type === 'contact_inactive' && (
              <div className="space-y-2">
                <Label htmlFor="days_inactive">Days of Inactivity</Label>
                <Input
                  id="days_inactive"
                  type="number"
                  min="1"
                  value={formData.trigger_config.days_inactive}
                  onChange={(e) => setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, days_inactive: parseInt(e.target.value) }
                  })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="task_title">Task Title</Label>
              <Input
                id="task_title"
                value={formData.action_config.title}
                onChange={(e) => setFormData({
                  ...formData,
                  action_config: { ...formData.action_config, title: e.target.value }
                })}
                required
                placeholder="e.g., Follow up with contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Task Priority</Label>
              <Select
                value={formData.action_config.priority}
                onValueChange={(value) => setFormData({
                  ...formData,
                  action_config: { ...formData.action_config, priority: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Rule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationRules;