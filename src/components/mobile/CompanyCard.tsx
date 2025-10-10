import { Building2, Phone, Globe, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    industry: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    quality_score: number;
  };
  onClick?: () => void;
}

const CompanyCard = ({ company, onClick }: CompanyCardProps) => {
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "High Quality" };
    if (score >= 50) return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low Quality" };
  };

  const scoreBadge = getScoreBadge(company.quality_score);

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
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{company.name}</h3>
              {company.industry && (
                <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
              )}
            </div>
          </div>
          <Badge variant={scoreBadge.variant} className="shrink-0 text-xs">
            {scoreBadge.label}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {company.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="truncate">{company.phone}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              <span className="truncate">{company.website}</span>
            </div>
          )}
          {company.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{company.address}</span>
            </div>
          )}
        </div>

        {/* Score Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Quality Score</span>
              <span className="font-medium">{company.quality_score}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  company.quality_score >= 80 ? "bg-success" : 
                  company.quality_score >= 50 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${company.quality_score}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
