import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

interface PipelineFunnelProps {
  dateRange?: DateRange;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const PipelineFunnel = ({ dateRange }: PipelineFunnelProps) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchPipelineData();
  }, [dateRange]);

  const fetchPipelineData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: deals } = await supabase
        .from('deals')
        .select('stage, amount')
        .eq('user_id', user.id);

      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
      const stageData = stages.map(stage => {
        const stageDeals = deals?.filter(d => d.stage === stage) || [];
        return {
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          count: stageDeals.length,
          value: stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
        };
      });

      setData(stageData);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: string) => [
                  name === 'count' ? value : `$${value.toLocaleString()}`,
                  name === 'count' ? 'Deals' : 'Value'
                ]}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
