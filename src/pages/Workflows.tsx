import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { WorkflowForm } from "@/components/workflows/WorkflowForm";
import { ExecutionHistory } from "@/components/workflows/ExecutionHistory";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Settings, Trash2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_conditions: any;
  actions: any;
  is_active: boolean;
  created_at: string;
}

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchWorkflows();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchWorkflows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } else {
      setWorkflows(data || []);
    }
    setLoading(false);
  };

  const handleToggleActive = async (workflow: Workflow) => {
    const { error } = await supabase
      .from('workflows')
      .update({ is_active: !workflow.is_active })
      .eq('id', workflow.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Workflow ${!workflow.is_active ? 'activated' : 'deactivated'}`,
      });
      fetchWorkflows();
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
      fetchWorkflows();
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    const labels: Record<string, string> = {
      contact_created: 'Contact Created',
      deal_stage_changed: 'Deal Stage Changed',
      task_completed: 'Task Completed',
      manual: 'Manual Trigger',
      scheduled: 'Scheduled'
    };
    return labels[triggerType] || triggerType;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workflows & Automations</h1>
            <p className="text-muted-foreground">
              Automate your CRM tasks and streamline your workflow
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/integrations')}>
              <Settings className="mr-2 h-4 w-4" />
              Integrations
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <Card className="p-12 text-center">
            <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first automation workflow to save time
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{workflow.name}</CardTitle>
                        <Badge variant={workflow.is_active ? "default" : "secondary"}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {workflow.description && (
                        <CardDescription>{workflow.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={() => handleToggleActive(workflow)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingWorkflow(workflow)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>Trigger: {getTriggerLabel(workflow.trigger_type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>{workflow.actions?.length || 0} action(s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <ExecutionHistory />
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
          </DialogHeader>
          <WorkflowForm
            onSuccess={() => {
              setShowCreateDialog(false);
              fetchWorkflows();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingWorkflow} onOpenChange={() => setEditingWorkflow(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
          </DialogHeader>
          {editingWorkflow && (
            <WorkflowForm
              workflow={editingWorkflow}
              onSuccess={() => {
                setEditingWorkflow(null);
                fetchWorkflows();
              }}
              onCancel={() => setEditingWorkflow(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workflows;
