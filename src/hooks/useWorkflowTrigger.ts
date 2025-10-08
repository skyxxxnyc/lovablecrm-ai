import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useWorkflowTrigger = () => {
  const { toast } = useToast();

  const triggerWorkflow = async (
    triggerType: string,
    triggerData: any
  ) => {
    try {
      // Fetch active workflows matching the trigger type
      const { data: workflows, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('trigger_type', triggerType)
        .eq('is_active', true);

      if (error || !workflows || workflows.length === 0) {
        return;
      }

      // Execute each matching workflow
      for (const workflow of workflows) {
        try {
          const { error: execError } = await supabase.functions.invoke('execute-workflow', {
            body: {
              workflowId: workflow.id,
              triggerData
            }
          });

          if (execError) {
            console.error(`Failed to execute workflow ${workflow.name}:`, execError);
          }
        } catch (err) {
          console.error('Workflow execution error:', err);
        }
      }
    } catch (error) {
      console.error('Error triggering workflows:', error);
    }
  };

  return { triggerWorkflow };
};
