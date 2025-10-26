import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Feedback {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch feedback: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Feedback status updated" });
      fetchFeedback();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      bug: "destructive",
      feature: "default",
      improvement: "secondary",
      other: "outline",
    };
    return colors[category] || "outline";
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading feedback...</CardContent></Card>;
  }

  const newCount = feedback.filter((f) => f.status === "new").length;
  const reviewedCount = feedback.filter((f) => f.status === "reviewed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Feedback</CardDescription>
            <CardTitle className="text-3xl">{feedback.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{newCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Reviewed</CardDescription>
            <CardTitle className="text-3xl text-green-500">{reviewedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        {feedback.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <Badge variant={item.status === "new" ? "secondary" : "outline"}>
                      {item.status === "new" ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {item.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription className="text-xs">{item.email}</CardDescription>
                  <p className="text-sm mt-2">{item.message}</p>
                  <CardDescription className="text-xs">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {item.status === "new" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(item.id, "reviewed")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                  )}
                  {item.status === "reviewed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(item.id, "new")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark New
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {feedback.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback submitted yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
