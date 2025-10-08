import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Calendar, FileText, User, Building2, DollarSign, Search } from "lucide-react";

interface TimelineActivity {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata: any;
}

const ACTIVITY_ICONS = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  contact: User,
  company: Building2,
  deal: DollarSign,
  task: FileText,
};

const ACTIVITY_COLORS = {
  email: "bg-blue-500",
  call: "bg-green-500",
  meeting: "bg-purple-500",
  note: "bg-yellow-500",
  contact: "bg-indigo-500",
  company: "bg-pink-500",
  deal: "bg-emerald-500",
  task: "bg-orange-500",
};

export const ActivityTimeline = () => {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('activity-timeline')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_timeline'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_timeline')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setActivities(data as any);
    }
    setLoading(false);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || activity.activity_type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedActivities = groupByDate(filteredActivities);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading activities...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CardTitle>Activity Timeline</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-2">
                {formatDate(date)}
              </h3>
              <div className="space-y-3 relative pl-6 border-l-2 border-border">
                {activities.map((activity) => (
                  <TimelineItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activities found
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const TimelineItem = ({ activity }: { activity: TimelineActivity }) => {
  const Icon = ACTIVITY_ICONS[activity.activity_type as keyof typeof ACTIVITY_ICONS] || FileText;
  const color = ACTIVITY_COLORS[activity.activity_type as keyof typeof ACTIVITY_COLORS] || "bg-gray-500";

  return (
    <div className="relative">
      <div className={`absolute -left-[29px] mt-1 h-4 w-4 rounded-full ${color} border-2 border-background flex items-center justify-center`}>
        <Icon className="h-2 w-2 text-white" />
      </div>
      <Card className="ml-2">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{activity.title}</h4>
              {activity.description && (
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {activity.activity_type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(activity.created_at).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const groupByDate = (activities: TimelineActivity[]) => {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, TimelineActivity[]>);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};
