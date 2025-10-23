import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart3, LineChart, PieChart, Download, Zap } from "lucide-react";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { PipelineFunnel } from "@/components/analytics/PipelineFunnel";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { LeadSourceChart } from "@/components/analytics/LeadSourceChart";
import { HotLeadsList } from "@/components/lead-scoring/HotLeadsList";
import { GoalTracker } from "@/components/reports/GoalTracker";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [calculatingScores, setCalculatingScores] = useState(false);

  const handleCalculateLeadScores = async () => {
    setCalculatingScores(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to calculate lead scores');
        return;
      }

      const { error } = await supabase.functions.invoke('calculate-lead-scores', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success('Lead scores calculated successfully!');
    } catch (error) {
      console.error('Error calculating lead scores:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to calculate lead scores');
    } finally {
      setCalculatingScores(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Advanced Analytics
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Deep insights into your sales performance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                <Button 
                  variant="outline" 
                  onClick={handleCalculateLeadScores}
                  disabled={calculatingScores}
                >
                  <Zap className={`h-4 w-4 mr-2 ${calculatingScores ? 'animate-spin' : ''}`} />
                  {calculatingScores ? 'Calculating...' : 'Calculate Lead Scores'}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList>
              <TabsTrigger value="revenue">
                <LineChart className="h-4 w-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="pipeline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="activity">
                <PieChart className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-6">
              <RevenueChart dateRange={dateRange} />
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-6">
              <PipelineFunnel dateRange={dateRange} />
            </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ActivityHeatmap dateRange={dateRange} />
                  <LeadSourceChart dateRange={dateRange} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <HotLeadsList />
                  <GoalTracker />
                </div>
              </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppLayout>
  );
};

export default Analytics;
