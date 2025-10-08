import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock, Play } from "lucide-react";

interface Execution {
  id: string;
  workflow_id: string;
  status: string;
  error_message: string | null;
  executed_at: string;
  completed_at: string | null;
  workflows: {
    name: string;
  };
}

export const ExecutionHistory = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutions();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('workflow-executions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions'
        },
        () => {
          fetchExecutions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*, workflows(name)')
      .order('executed_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setExecutions(data as any);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      case 'running':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (executions.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed">
        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No workflow executions yet</p>
      </Card>
    );
  }

  return (
    <Card className="border hover:shadow-md transition-all">
      <CardHeader className="border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">Recent Executions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {executions.map((execution, index) => (
              <Card 
                key={execution.id} 
                className="p-4 hover:shadow-sm transition-all border hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(execution.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {execution.workflows?.name || 'Unknown Workflow'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(execution.executed_at).toLocaleString()}
                      </p>
                      {execution.error_message && (
                        <p className="text-xs text-destructive mt-1 line-clamp-2">
                          Error: {execution.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(execution.status)} shadow-sm flex-shrink-0`}
                  >
                    {execution.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
