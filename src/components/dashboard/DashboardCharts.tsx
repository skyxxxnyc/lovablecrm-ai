import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

const STAGE_COLORS = {
  lead: "#64748b",
  qualified: "#3b82f6",
  proposal: "#a855f7",
  negotiation: "#f97316",
  won: "#22c55e",
  lost: "#ef4444",
};

export const DashboardCharts = () => {
  const [stageData, setStageData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topContactsData, setTopContactsData] = useState<any[]>([]);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    // Stage distribution
    const { data: deals } = await supabase
      .from('deals')
      .select('stage, amount');

    if (deals) {
      const stageGroups = deals.reduce((acc, deal) => {
        const stage = deal.stage || 'lead';
        if (!acc[stage]) {
          acc[stage] = { name: stage, value: 0, count: 0 };
        }
        acc[stage].value += deal.amount || 0;
        acc[stage].count += 1;
        return acc;
      }, {} as Record<string, any>);

      setStageData(Object.values(stageGroups));
    }

    // Revenue over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: wonDeals } = await supabase
      .from('deals')
      .select('amount, updated_at')
      .eq('stage', 'won')
      .gte('updated_at', sixMonthsAgo.toISOString());

    if (wonDeals) {
      const monthlyRevenue = wonDeals.reduce((acc, deal) => {
        const month = new Date(deal.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += deal.amount || 0;
        return acc;
      }, {} as Record<string, number>);

      const revenueArray = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue,
      }));

      setRevenueData(revenueArray);
    }

    // Top contacts by deal value
    const { data: contactDeals } = await supabase
      .from('deals')
      .select('amount, contact_id, contacts(first_name, last_name)')
      .not('contact_id', 'is', null);

    if (contactDeals) {
      const contactGroups = contactDeals.reduce((acc, deal: any) => {
        const contactId = deal.contact_id;
        const contactName = deal.contacts 
          ? `${deal.contacts.first_name} ${deal.contacts.last_name}` 
          : 'Unknown';
        
        if (!acc[contactId]) {
          acc[contactId] = { name: contactName, value: 0 };
        }
        acc[contactId].value += deal.amount || 0;
        return acc;
      }, {} as Record<string, any>);

      const topContacts = Object.values(contactGroups)
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);

      setTopContactsData(topContacts);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Deal Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.name as keyof typeof STAGE_COLORS]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Contacts by Deal Value</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topContactsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
