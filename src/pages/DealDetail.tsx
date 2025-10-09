import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DealDetailPanel from "@/components/DealDetailPanel";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number | null;
  probability: number;
  expected_close_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  const fetchDeal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Deal not found",
          description: "The deal you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/deals");
        return;
      }

      setDeal(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/deals");
  };

  const getStageBadge = (stage: string) => {
    const stageColors: Record<string, "default" | "secondary" | "outline"> = {
      lead: "outline",
      qualified: "secondary",
      proposal: "secondary",
      negotiation: "default",
      won: "default",
      lost: "outline",
    };
    return <Badge variant={stageColors[stage] || "outline"}>{stage}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/deals")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading deal details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/deals")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="h-8 w-8 text-primary" />
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{deal.title}</h1>
            {getStageBadge(deal.stage)}
          </div>
        </div>

        <DealDetailPanel
          dealId={deal.id}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
