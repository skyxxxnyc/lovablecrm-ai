import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle2, Circle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";
import MobileFAB from "@/components/mobile/MobileFAB";
import { useIsMobile } from "@/hooks/use-mobile";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TaskForm } from "@/components/forms/TaskForm";
import { AppLayout } from "@/components/AppLayout";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  contact_id: string | null;
  deal_id: string | null;
  contacts?: {
    first_name: string;
    last_name: string;
  };
  deals?: {
    title: string;
  };
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const DialogWrapper = isMobile ? Drawer : Dialog;
  const DialogContentWrapper = isMobile ? DrawerContent : DialogContent;
  const DialogHeaderWrapper = isMobile ? DrawerHeader : DialogHeader;
  const DialogTitleWrapper = isMobile ? DrawerTitle : DialogTitle;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*, contacts(first_name, last_name), deals(title)")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const { error } = await supabase
      .from("tasks")
      .update({ 
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null
      })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
      return;
    }

    // Trigger workflows for task completion
    if (newStatus === "completed") {
      try {
        const { data: workflows } = await supabase
          .from('workflows')
          .select('id')
          .eq('trigger_type', 'task_completed')
          .eq('is_active', true);

        if (workflows && workflows.length > 0) {
          for (const workflow of workflows) {
            await supabase.functions.invoke('execute-workflow', {
              body: {
                workflowId: workflow.id,
                triggerData: { task_id: taskId }
              }
            });
          }
        }
      } catch (err) {
        console.error('Error triggering workflows:', err);
      }
    }

    fetchTasks();
    toast({
      title: "Success",
      description: `Task marked as ${newStatus}`,
    });
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task deleted successfully",
    });

    fetchTasks();
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>;
  };

  const openNewTaskDialog = () => {
    setEditingTaskId(undefined);
    setShowTaskDialog(true);
  };

  const openEditTaskDialog = (taskId: string) => {
    setEditingTaskId(taskId);
    setShowTaskDialog(true);
  };

  return (
    <AppLayout>
      <ResponsiveLayout>
        <div className={isMobile ? "p-0" : "p-6"}>
          {!isMobile && <Breadcrumbs items={[{ label: "Tasks" }]} />}
          
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className={isMobile ? "p-4 border-b border-border" : ""}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={isMobile ? "text-2xl font-bold flex items-center gap-2" : "text-3xl font-bold flex items-center gap-2"}>
                    <CheckCircle2 className={isMobile ? "h-6 w-6 text-primary" : "h-8 w-8 text-primary"} />
                    Tasks
                  </h1>
                  {!isMobile && (
                    <p className="text-muted-foreground mt-1">
                      Manage your task list
                    </p>
                  )}
                </div>
                {!isMobile && (
                  <Button onClick={openNewTaskDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className={isMobile ? "px-4" : ""}>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Content */}
            <div className={isMobile ? "px-4 pb-20 space-y-3" : "space-y-3"}>
              {loading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading tasks...
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No tasks found" : "No tasks yet"}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleStatus(task.id, task.status)}
                          className="mt-1 flex-shrink-0"
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </h3>
                            {getPriorityBadge(task.priority)}
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                            {task.contacts && (
                              <span>
                                {task.contacts.first_name} {task.contacts.last_name}
                              </span>
                            )}
                            {task.deals && (
                              <span>Deal: {task.deals.title}</span>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditTaskDialog(task.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(task.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </ResponsiveLayout>

      {isMobile && <MobileFAB onNewTask={openNewTaskDialog} />}

      <DialogWrapper open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContentWrapper className={isMobile ? "" : "max-w-2xl"}>
          <DialogHeaderWrapper>
            <DialogTitleWrapper>{editingTaskId ? "Edit Task" : "Create Task"}</DialogTitleWrapper>
          </DialogHeaderWrapper>
          <TaskForm
            taskId={editingTaskId}
            onSuccess={() => {
              setShowTaskDialog(false);
              fetchTasks();
            }}
            onCancel={() => setShowTaskDialog(false)}
          />
        </DialogContentWrapper>
      </DialogWrapper>
    </AppLayout>
  );
}
