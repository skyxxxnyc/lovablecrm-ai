import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart3, LineChart, PieChart, Download } from "lucide-react";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { PipelineFunnel } from "@/components/analytics/PipelineFunnel";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { LeadSourceChart } from "@/components/analytics/LeadSourceChart";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
