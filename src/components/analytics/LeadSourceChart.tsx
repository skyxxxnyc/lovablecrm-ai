import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

interface LeadSourceChartProps {
  dateRange?: DateRange;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const LeadSourceChart = ({ dateRange }: LeadSourceChartProps) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchLeadSourceData();
  }, [dateRange]);

  const fetchLeadSourceData = async () => {
    try {
      // Placeholder data - would need a lead_source field in contacts table
      const mockData = [
        { name: 'Website', value: 45 },
        { name: 'Referral', value: 30 },
        { name: 'Social Media', value: 15 },
        { name: 'Direct', value: 10 },
      ];
      setData(mockData);
    } catch (error) {
      console.error('Error fetching lead source data:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
