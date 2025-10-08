import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/metrics/MetricCard";
import { DollarSign, TrendingUp, Target, Clock } from "lucide-react";

export const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalPipeline: 0,
    averageDealSize: 0,
    winRate: 0,
    salesVelocity: 0,
  });

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('deals-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals'
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    // Total pipeline value (open deals)
    const { data: openDeals } = await supabase
      .from('deals')
      .select('amount')
      .not('stage', 'in', '("won","lost")');

    const totalPipeline = openDeals?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;

    // Average deal size
    const { data: allDeals } = await supabase
      .from('deals')
      .select('amount');

    const averageDealSize = allDeals && allDeals.length > 0
      ? allDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / allDeals.length
      : 0;

    // Win rate
    const { data: closedDeals } = await supabase
      .from('deals')
      .select('stage')
      .in('stage', ['won', 'lost']);

    const wonDeals = closedDeals?.filter(d => d.stage === 'won').length || 0;
    const totalClosed = closedDeals?.length || 1;
    const winRate = (wonDeals / totalClosed) * 100;

    // Sales velocity (average days to close)
    const { data: wonDealsWithDates } = await supabase
      .from('deals')
      .select('created_at, updated_at')
      .eq('stage', 'won')
      .not('created_at', 'is', null)
      .not('updated_at', 'is', null);

    let salesVelocity = 0;
    if (wonDealsWithDates && wonDealsWithDates.length > 0) {
      const totalDays = wonDealsWithDates.reduce((sum, deal) => {
        const created = new Date(deal.created_at);
        const closed = new Date(deal.updated_at);
        const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      salesVelocity = totalDays / wonDealsWithDates.length;
    }

    setMetrics({
      totalPipeline,
      averageDealSize,
      winRate,
      salesVelocity,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Pipeline"
        value={formatCurrency(metrics.totalPipeline)}
        icon={DollarSign}
        description="Open deals value"
      />
      <MetricCard
        title="Average Deal Size"
        value={formatCurrency(metrics.averageDealSize)}
        icon={TrendingUp}
        description="Across all deals"
      />
      <MetricCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        icon={Target}
        description="Closed deals won"
        changeType={metrics.winRate >= 50 ? "positive" : "negative"}
      />
      <MetricCard
        title="Sales Velocity"
        value={`${Math.round(metrics.salesVelocity)} days`}
        icon={Clock}
        description="Average time to close"
      />
    </div>
  );
};
