import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { WorkflowForm } from "@/components/workflows/WorkflowForm";
import { WorkflowTemplates, WorkflowTemplate } from "@/components/workflows/WorkflowTemplates";
import { ExecutionHistory } from "@/components/workflows/ExecutionHistory";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Settings, Trash2, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
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

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatesDialog(false);
    setShowCreateDialog(true);
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
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">Workflows</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Workflows & Automations
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Automate your CRM tasks and streamline your workflow
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/integrations')}
              className="flex-1 md:flex-initial transition-all hover:border-primary hover:text-primary"
            >
              <Settings className="mr-2 h-4 w-4" />
              Integrations
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowTemplatesDialog(true)}
              className="flex-1 md:flex-initial transition-all hover:border-primary hover:text-primary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button 
              onClick={() => {
                setSelectedTemplate(null);
                setShowCreateDialog(true);
              }}
              className="flex-1 md:flex-initial shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground text-sm">Loading workflows...</p>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed hover:border-primary/50 transition-colors animate-fade-in-up">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first automation workflow to save time and boost productivity
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplatesDialog(true)} 
                  className="shadow-sm hover:shadow transition-all"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setShowCreateDialog(true);
                  }} 
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow, index) => (
              <Card 
                key={workflow.id} 
                className="group hover:shadow-md transition-all duration-300 border hover:border-primary/30 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors">
                          {workflow.name}
                        </CardTitle>
                        <Badge 
                          variant={workflow.is_active ? "default" : "secondary"}
                          className={workflow.is_active 
                            ? "bg-success text-success-foreground shadow-sm" 
                            : "bg-muted"
                          }
                        >
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {workflow.description && (
                        <CardDescription className="text-sm line-clamp-2">
                          {workflow.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="flex items-center gap-2 mr-2">
                        <Switch
                          checked={workflow.is_active}
                          onCheckedChange={() => handleToggleActive(workflow)}
                          className="data-[state=checked]:bg-success"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingWorkflow(workflow)}
                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(workflow.id)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Play className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{getTriggerLabel(workflow.trigger_type)}</span>
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium">{workflow.actions?.length || 0} action(s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <ExecutionHistory />
        </div>
      </div>

      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Workflow Templates</DialogTitle>
          </DialogHeader>
          <WorkflowTemplates onSelectTemplate={handleSelectTemplate} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) setSelectedTemplate(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedTemplate ? `Create from Template: ${selectedTemplate.name}` : 'Create Workflow'}
            </DialogTitle>
          </DialogHeader>
          <WorkflowForm
            workflow={selectedTemplate ? {
              name: selectedTemplate.name,
              description: selectedTemplate.description,
              trigger_type: selectedTemplate.trigger_type,
              actions: selectedTemplate.actions
            } : undefined}
            onSuccess={() => {
              setShowCreateDialog(false);
              setSelectedTemplate(null);
              fetchWorkflows();
            }}
            onCancel={() => {
              setShowCreateDialog(false);
              setSelectedTemplate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingWorkflow} onOpenChange={() => setEditingWorkflow(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Workflow</DialogTitle>
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
