import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  amount: number | null;
  probability: number;
  expected_close_date: string | null;
  stage: string;
  contact_id: string | null;
  company_id: string | null;
  contacts?: { first_name: string; last_name: string };
  companies?: { name: string };
}

const STAGES = [
  { id: "lead", label: "Lead", color: "bg-slate-500" },
  { id: "qualified", label: "Qualified", color: "bg-blue-500" },
  { id: "proposal", label: "Proposal", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "won", label: "Won", color: "bg-green-500" },
  { id: "lost", label: "Lost", color: "bg-red-500" }
];

export const PipelineBoard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchDeals();

    const channel = supabase
      .channel('pipeline-deals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals'
        },
        () => {
          fetchDeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDeals = async () => {
    const { data, error } = await supabase
      .from('deals')
      .select('*, contacts(first_name, last_name), companies(name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeals(data as any);
    }
  };

  const handleDragStart = (event: any) => {
    const deal = deals.find(d => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStage = over.id as string;

    const { error } = await supabase
      .from('deals')
      .update({ stage: newStage })
      .eq('id', dealId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update deal stage",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Deal stage updated",
      });
    }
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn(
        "grid gap-4",
        isMobile 
          ? "grid-cols-1" 
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      )}>
        {STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={getDealsByStage(stage.id)}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeDeal ? (
          <DealCard deal={activeDeal} formatCurrency={formatCurrency} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface PipelineColumnProps {
  stage: { id: string; label: string; color: string };
  deals: Deal[];
  formatCurrency: (amount: number | null) => string;
  isMobile?: boolean;
}

const PipelineColumn = ({ stage, deals, formatCurrency, isMobile }: PipelineColumnProps) => {
  const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

  return (
    <Card className={cn(
      "flex flex-col",
      isMobile ? "h-[400px]" : "h-[600px]"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
          <Badge variant="secondary" className={`${stage.color} text-white`}>
            {deals.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</p>
      </CardHeader>
      <CardContent className="flex-1 p-2">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} formatCurrency={formatCurrency} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface DealCardProps {
  deal: Deal;
  formatCurrency: (amount: number | null) => string;
  isDragging?: boolean;
}

const DealCard = ({ deal, formatCurrency, isDragging = false }: DealCardProps) => {
  return (
    <Card 
      className={`p-3 cursor-move hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
      draggable
    >
      <h4 className="font-medium text-sm mb-2">{deal.title}</h4>
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(deal.amount)}</span>
          <span className="ml-1">({deal.probability}%)</span>
        </div>
        {deal.expected_close_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
          </div>
        )}
        {deal.companies?.name && (
          <p className="text-xs text-muted-foreground truncate">{deal.companies.name}</p>
        )}
      </div>
    </Card>
  );
};
