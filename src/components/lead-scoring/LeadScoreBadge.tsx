import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeadScoreBadgeProps {
  score: number;
  previousScore?: number;
  signals?: Array<{ type: string; weight: number; max: number }>;
  size?: "sm" | "md" | "lg";
}

export const LeadScoreBadge = ({ score, previousScore, signals, size = "md" }: LeadScoreBadgeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-success text-success-foreground";
    if (score >= 40) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getTrend = () => {
    if (!previousScore) return null;
    if (score > previousScore) return <TrendingUp className="h-3 w-3" />;
    if (score < previousScore) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getScoreColor(score)} ${sizeClasses[size]} font-semibold flex items-center gap-1`}>
            {score}/100
            {getTrend()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Lead Score Breakdown</p>
            {signals && signals.length > 0 ? (
              <div className="space-y-1">
                {signals.map((signal, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="capitalize">{signal.type.replace(/_/g, ' ')}</span>
                    <span>{signal.weight}/{signal.max}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No detailed breakdown available</p>
            )}
            {previousScore !== undefined && (
              <p className="text-xs text-muted-foreground pt-1 border-t">
                Previous score: {previousScore}/100
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
