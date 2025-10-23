import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  period_type: string;
  period_start: string;
  period_end: string;
  status: string;
}

export const GoalTracker = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order('period_end', { ascending: true });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      revenue: 'Revenue',
      deals_closed: 'Deals Closed',
      new_contacts: 'New Contacts',
      activities: 'Activities',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading goals...</div>;
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goals
          </CardTitle>
          <CardDescription>No active goals. Create goals to track your progress.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Active Goals
      </h3>
      {goals.map((goal) => {
        const progress = getProgressPercentage(goal.current_value, goal.target_value);
        const isAchieved = goal.current_value >= goal.target_value;
        const isOnTrack = progress >= 50;

        return (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{getGoalTypeLabel(goal.goal_type)}</CardTitle>
                <Badge variant={isAchieved ? "default" : isOnTrack ? "secondary" : "outline"}>
                  {isAchieved ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Achieved
                    </>
                  ) : isOnTrack ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      On Track
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Behind
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription>
                {goal.period_type.charAt(0).toUpperCase() + goal.period_type.slice(1)} Goal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
