import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DealDetailPanel from "@/components/DealDetailPanel";
import { Badge } from "@/components/ui/badge";
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

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
      <ResponsiveLayout>
        <div className={isMobile ? "p-4" : "p-6"}>
          {!isMobile && (
            <Breadcrumbs items={[
              { label: "Deals", href: "/deals" },
              { label: "Loading..." }
            ]} />
          )}
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading deal details...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!deal) {
    return null;
  }

  return (
    <ResponsiveLayout>
      <div className={isMobile ? "p-0" : "p-6"}>
        {!isMobile && (
          <Breadcrumbs items={[
            { label: "Deals", href: "/deals" },
            { label: deal.title }
          ]} />
        )}
        
        {isMobile && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/deals")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}
        
        {!isMobile && (
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
        )}

        <div className={cn(
          "flex items-center gap-3",
          isMobile ? "p-4 pb-4" : "mb-6"
        )}>
          <Briefcase className={isMobile ? "h-6 w-6 text-primary" : "h-8 w-8 text-primary"} />
          <div className="flex items-center gap-3">
            <h1 className={isMobile ? "text-2xl font-bold" : "text-3xl font-bold"}>{deal.title}</h1>
            {getStageBadge(deal.stage)}
          </div>
        </div>

        <DealDetailPanel
          dealId={deal.id}
          onClose={handleClose}
        />
      </div>
    </ResponsiveLayout>
  );
}
