import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, User } from "lucide-react";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id?: string;
  notes?: string;
}

interface ContactCardProps {
  contact: Contact;
  onSelect?: (id: string) => void;
}

export const ContactCard = ({ contact, onSelect }: ContactCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-4 w-4" />
          {contact.first_name} {contact.last_name}
        </CardTitle>
        {contact.position && (
          <Badge variant="secondary" className="w-fit">
            {contact.position}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.company_id && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span>Company ID: {contact.company_id}</span>
          </div>
        )}
        {onSelect && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => onSelect(contact.id)}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
