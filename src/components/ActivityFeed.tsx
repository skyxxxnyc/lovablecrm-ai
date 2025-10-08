import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Activity, Mail, User, Briefcase, CheckSquare, Calendar } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  icon: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchActivities();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchActivities)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, fetchActivities)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, fetchActivities)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchActivities)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch recent activities
    const { data: recentActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent contacts
    const { data: recentContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch recent deals
    const { data: recentDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch recent tasks
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine and format all activities
    const combined: ActivityItem[] = [
      ...(recentActivities?.map(a => ({
        id: a.id,
        type: a.activity_type,
        title: a.subject || 'Activity',
        description: a.description || '',
        created_at: a.created_at,
        icon: 'activity'
      })) || []),
      ...(recentContacts?.map(c => ({
        id: c.id,
        type: 'contact',
        title: `New contact: ${c.first_name} ${c.last_name}`,
        description: c.email || '',
        created_at: c.created_at,
        icon: 'user'
      })) || []),
      ...(recentDeals?.map(d => ({
        id: d.id,
        type: 'deal',
        title: `Deal: ${d.title}`,
        description: `Stage: ${d.stage}`,
        created_at: d.created_at,
        icon: 'briefcase'
      })) || []),
      ...(recentTasks?.map(t => ({
        id: t.id,
        type: 'task',
        title: `Task: ${t.title}`,
        description: t.status,
        created_at: t.created_at,
        icon: 'task'
      })) || [])
    ];

    // Sort by date and limit
    const sorted = combined
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);

    setActivities(sorted);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'user': return <User className="h-4 w-4" />;
      case 'briefcase': return <Briefcase className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                <div className="mt-1">
                  <div className="p-2 rounded-full bg-muted">
                    {getIcon(activity.icon)}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};