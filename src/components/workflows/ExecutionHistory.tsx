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
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (executions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No workflow executions yet</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Executions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {executions.map((execution) => (
              <Card key={execution.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(execution.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {execution.workflows?.name || 'Unknown Workflow'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(execution.executed_at).toLocaleString()}
                      </p>
                      {execution.error_message && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {execution.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(execution.status)} text-white`}
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
