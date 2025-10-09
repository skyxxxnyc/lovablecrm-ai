import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { GoalDialog } from "./GoalDialog";

export const GoalTracker = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Active Goals</h3>
          <p className="text-sm text-muted-foreground">Track progress toward your targets</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active goals</p>
            <p className="text-sm text-muted-foreground mt-1">
              Set your first goal to start tracking progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = (Number(goal.current_value) / Number(goal.target_value)) * 100;
            const isAhead = progress >= 75;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="capitalize">{goal.goal_type} Goal</span>
                    {isAhead && <TrendingUp className="h-4 w-4 text-success" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{goal.period_type}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showDialog && (
        <GoalDialog
          onClose={() => setShowDialog(false)}
          onSuccess={() => {
            setShowDialog(false);
            fetchGoals();
          }}
        />
      )}
    </div>
  );
};
