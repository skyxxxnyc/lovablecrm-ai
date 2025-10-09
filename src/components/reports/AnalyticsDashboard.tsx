import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HotLeadsList } from "@/components/lead-scoring/HotLeadsList";

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    revenueChange: 0,
    deals: 0,
    dealsChange: 0,
    contacts: 0,
    contactsChange: 0,
    activities: 0,
    activitiesChange: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current month deals
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const { data: deals } = await supabase
        .from('deals')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .eq('stage', 'won');

      const currentMonthRevenue = deals
        ?.filter(d => new Date(d.created_at) >= startOfMonth)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;

      const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activityCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      setMetrics({
        revenue: currentMonthRevenue,
        revenueChange: 12, // Placeholder
        deals: deals?.length || 0,
        dealsChange: 8,
        contacts: contactCount || 0,
        contactsChange: 5,
        activities: activityCount || 0,
        activitiesChange: 15,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }: any) => {
    const isPositive = change >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {format === 'currency' ? `$${value.toLocaleString()}` : value.toLocaleString()}
          </div>
          <div className={`flex items-center text-xs mt-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {Math.abs(change)}% vs last month
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue (MTD)"
          value={metrics.revenue}
          change={metrics.revenueChange}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Deals Closed"
          value={metrics.deals}
          change={metrics.dealsChange}
          icon={Target}
        />
        <MetricCard
          title="Total Contacts"
          value={metrics.contacts}
          change={metrics.contactsChange}
          icon={Users}
        />
        <MetricCard
          title="Activities (MTD)"
          value={metrics.activities}
          change={metrics.activitiesChange}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Lead → Qualified</span>
                  <span className="text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Qualified → Proposal</span>
                  <span className="text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Proposal → Won</span>
                  <span className="text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <HotLeadsList />
        </div>
      </div>
    </div>
  );
};
