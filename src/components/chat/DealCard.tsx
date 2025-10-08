import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount?: number;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
}

interface DealCardProps {
  deal: Deal;
}

export const DealCard = ({ deal }: DealCardProps) => {
  const stageColors: Record<string, string> = {
    lead: 'bg-gray-500',
    qualified: 'bg-blue-500',
    proposal: 'bg-yellow-500',
    negotiation: 'bg-orange-500',
    closed: 'bg-green-500',
    lost: 'bg-red-500'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{deal.title}</CardTitle>
        <Badge 
          variant="secondary" 
          className={`w-fit ${stageColors[deal.stage] || 'bg-gray-500'} text-white`}
        >
          {deal.stage}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {deal.amount && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>${deal.amount.toLocaleString()}</span>
          </div>
        )}
        {deal.probability !== null && deal.probability !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{deal.probability}% probability</span>
          </div>
        )}
        {deal.expected_close_date && (
          <div className="text-sm text-muted-foreground">
            Expected close: {new Date(deal.expected_close_date).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
