import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

interface ActivityHeatmapProps {
  dateRange?: DateRange;
}

export const ActivityHeatmap = ({ dateRange }: ActivityHeatmapProps) => {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchActivityData();
  }, [dateRange]);

  const fetchActivityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activities } = await supabase
        .from('activities')
        .select('activity_type, created_at')
        .eq('user_id', user.id);

      const grouped = activities?.reduce((acc: any, activity) => {
        if (!acc[activity.activity_type]) {
          acc[activity.activity_type] = 0;
        }
        acc[activity.activity_type] += 1;
        return acc;
      }, {});

      setData(grouped || {});
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const types = ['call', 'email', 'meeting', 'note'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {types.map((type) => {
            const count = data[type] || 0;
            const total = Object.values(data).reduce((sum: number, val: any) => sum + val, 0) as number;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={type}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize">{type}s</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
