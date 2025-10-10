import { Briefcase, DollarSign, Calendar, TrendingUp, User, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: {
    id: string;
    title: string;
    stage: string;
    amount: number | null;
    probability: number;
    expected_close_date: string | null;
  };
  contact?: { first_name: string; last_name: string } | null;
  company?: { name: string } | null;
  onClick?: () => void;
}

const DealCard = ({ deal, contact, company, onClick }: DealCardProps) => {
  const stageColors: Record<string, { bg: string; text: string }> = {
    lead: { bg: "bg-muted", text: "text-muted-foreground" },
    qualified: { bg: "bg-primary/10", text: "text-primary" },
    proposal: { bg: "bg-warning/10", text: "text-warning" },
    negotiation: { bg: "bg-accent", text: "text-accent-foreground" },
    won: { bg: "bg-success/10", text: "text-success" },
    lost: { bg: "bg-destructive/10", text: "text-destructive" },
  };

  const stageStyle = stageColors[deal.stage] || stageColors.lead;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-all duration-200 active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{deal.title}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact && (
                  <span className="text-sm text-muted-foreground">
                    {contact.first_name} {contact.last_name}
                  </span>
                )}
                {company && contact && <span className="text-muted-foreground">•</span>}
                {company && (
                  <span className="text-sm text-muted-foreground">{company.name}</span>
                )}
              </div>
            </div>
          </div>
          <Badge className={cn("shrink-0 text-xs capitalize", stageStyle.bg, stageStyle.text)}>
            {deal.stage}
          </Badge>
        </div>

        {/* Amount & Probability */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Deal Value</span>
            </div>
            <p className="font-semibold text-lg">{formatCurrency(deal.amount)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Probability</span>
            </div>
            <p className="font-semibold text-lg">{deal.probability}%</p>
          </div>
        </div>

        {/* Expected Close Date */}
        {deal.expected_close_date && (
          <div className="flex items-center gap-2 pt-2 border-t border-border text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Close Date:</span>
            <span className="font-medium">
              {format(new Date(deal.expected_close_date), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DealCard;
