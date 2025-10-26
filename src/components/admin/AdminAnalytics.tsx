import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, CheckSquare, TrendingUp, Activity } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalTasks: number;
  totalRevenue: number;
  activeWorkflows: number;
  completedTasks: number;
}

export function AdminAnalytics() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalContacts: 0,
    totalCompanies: 0,
    totalDeals: 0,
    totalTasks: 0,
    totalRevenue: 0,
    activeWorkflows: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: contactsCount },
        { count: companiesCount },
        { count: dealsCount },
        { count: tasksCount },
        { count: completedTasksCount },
        { count: workflowsCount },
        { data: dealsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("deals").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("workflows").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("deals").select("amount").eq("stage", "won"),
      ]);

      const totalRevenue = dealsData?.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalContacts: contactsCount || 0,
        totalCompanies: companiesCount || 0,
        totalDeals: dealsCount || 0,
        totalTasks: tasksCount || 0,
        totalRevenue,
        activeWorkflows: workflowsCount || 0,
        completedTasks: completedTasksCount || 0,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading analytics...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Key metrics across the entire platform</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Users</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Contacts</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Companies</CardDescription>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Deals</CardDescription>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Completed Tasks</CardDescription>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Workflows</CardDescription>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
