import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Filter, ChevronDown, Mail, Phone, Video, FileText } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityHistoryProps {
  entityType: "contact" | "deal" | "company";
  entityId: string;
}

interface ActivityItem {
  id: string;
  entity_type: string;
  title: string;
  description: string | null;
  activity_type: string;
  created_at: string;
  metadata: any;
}

const activityIcons: Record<string, any> = {
  email: Mail,
  call: Phone,
  meeting: Video,
  note: FileText,
  task: Activity,
};

const activityColors: Record<string, string> = {
  email: "text-blue-500",
  call: "text-green-500",
  meeting: "text-purple-500",
  note: "text-orange-500",
  task: "text-pink-500",
};

export const ActivityHistory = ({ entityType, entityId }: ActivityHistoryProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    fetchActivities();
  }, [entityId, filter, page]);

  const fetchActivities = async () => {
    setLoading(true);

    let query = supabase
      .from("activity_timeline")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (filter !== "all") {
      query = query.eq("activity_type", filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setActivities(page === 1 ? data : [...activities, ...data]);
      setHasMore(data.length === pageSize);
    }

    setLoading(false);
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const groups: Record<string, ActivityItem[]> = {};

    activities.forEach((activity) => {
      const date = new Date(activity.created_at);
      let label: string;

      if (isToday(date)) {
        label = "Today";
      } else if (isYesterday(date)) {
        label = "Yesterday";
      } else if (isThisWeek(date)) {
        label = format(date, "EEEE");
      } else {
        label = format(date, "MMMM d, yyyy");
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(activity);
    });

    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-8">
        <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Activity Timeline</h3>
        </div>
        <Select value={filter} onValueChange={(value) => { setFilter(value); setPage(1); }}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activities.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No activities yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Activities will appear here as you interact
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card py-2">
                {date}
              </h4>
              <div className="space-y-2 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-border">
                {items.map((activity) => {
                  const Icon = activityIcons[activity.activity_type] || Activity;
                  const colorClass = activityColors[activity.activity_type] || "text-primary";
                  
                  return (
                    <Card key={activity.id} className="p-3 ml-8 relative animate-fade-in-up">
                      <div className={cn("absolute -left-8 top-3 p-1.5 rounded-full bg-background border-2 border-border", colorClass)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), "h:mm a")}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {activity.description}
                        </p>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Activity className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
