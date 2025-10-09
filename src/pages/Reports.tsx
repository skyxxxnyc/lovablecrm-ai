import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { SavedReports } from "@/components/reports/SavedReports";
import { GoalTracker } from "@/components/reports/GoalTracker";
import { AnalyticsDashboard } from "@/components/reports/AnalyticsDashboard";

const Reports = () => {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Analytics & Reports
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track performance, generate reports, and monitor goals
              </p>
            </div>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Saved Reports</TabsTrigger>
            <TabsTrigger value="goals">Goals & KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <SavedReports />
          </TabsContent>

          <TabsContent value="goals">
            <GoalTracker />
          </TabsContent>
        </Tabs>

        {showBuilder && (
          <ReportBuilder onClose={() => setShowBuilder(false)} />
        )}
      </main>
    </div>
  );
};

export default Reports;
