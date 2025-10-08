import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Phone, MapPin } from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {company.name}
        </CardTitle>
        {company.industry && (
          <Badge variant="secondary" className="w-fit">
            {company.industry}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {company.website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-3 w-3" />
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {company.website}
            </a>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{company.phone}</span>
          </div>
        )}
        {company.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{company.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
