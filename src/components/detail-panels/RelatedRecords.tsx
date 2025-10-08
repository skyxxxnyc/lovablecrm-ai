import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Plus, ExternalLink } from "lucide-react";

interface RelatedRecordsProps {
  entityType: "contact" | "deal" | "company";
  entityId: string;
  onNavigate?: (type: string, id: string) => void;
}

export const RelatedRecords = ({ entityType, entityId, onNavigate }: RelatedRecordsProps) => {
  const [related, setRelated] = useState<{
    company?: any;
    contact?: any;
    contacts?: any[];
    deals?: any[];
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelated();
  }, [entityId, entityType]);

  const fetchRelated = async () => {
    setLoading(true);

    try {
      if (entityType === "contact") {
        const { data: contact } = await supabase
          .from("contacts")
          .select("company_id, companies(id, name, industry)")
          .eq("id", entityId)
          .single();

        const { data: deals } = await supabase
          .from("deals")
          .select("id, title, stage, amount")
          .eq("contact_id", entityId)
          .order("created_at", { ascending: false });

        setRelated({
          company: contact?.companies || null,
          deals: deals || [],
        });
      } else if (entityType === "deal") {
        const { data: deal } = await supabase
          .from("deals")
          .select("contact_id, company_id, contacts(id, first_name, last_name, email), companies(id, name, industry)")
          .eq("id", entityId)
          .single();

        setRelated({
          contact: deal?.contacts || null,
          company: deal?.companies || null,
        });
      } else if (entityType === "company") {
        const { data: contacts } = await supabase
          .from("contacts")
          .select("id, first_name, last_name, email, position")
          .eq("company_id", entityId)
          .order("created_at", { ascending: false });

        const { data: deals } = await supabase
          .from("deals")
          .select("id, title, stage, amount")
          .eq("company_id", entityId)
          .order("created_at", { ascending: false });

        setRelated({
          contacts: contacts || [],
          deals: deals || [],
        });
      }
    } catch (error) {
      console.error("Error fetching related records:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Company */}
      {(entityType === "contact" || entityType === "deal") && related.company && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Company</h3>
            </div>
          </div>
          <Card className="p-3 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onNavigate?.("company", related.company.id)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{related.company.name}</p>
                {related.company.industry && (
                  <p className="text-xs text-muted-foreground">{related.company.industry}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* Contact */}
      {entityType === "deal" && related.contact && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Contact</h3>
            </div>
          </div>
          <Card className="p-3 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onNavigate?.("contact", related.contact.id)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">
                  {related.contact.first_name} {related.contact.last_name}
                </p>
                {related.contact.email && (
                  <p className="text-xs text-muted-foreground">{related.contact.email}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* Contacts List */}
      {entityType === "company" && related.contacts && related.contacts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Contacts ({related.contacts.length})</h3>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {related.contacts.slice(0, 5).map((contact: any) => (
              <Card key={contact.id} className="p-3 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onNavigate?.("contact", contact.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.position && (
                      <p className="text-xs text-muted-foreground">{contact.position}</p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Deals */}
      {related.deals && related.deals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Deals ({related.deals.length})</h3>
            </div>
            {entityType !== "deal" && (
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {related.deals.slice(0, 5).map((deal: any) => (
              <Card key={deal.id} className="p-3 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onNavigate?.("deal", deal.id)}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium">{deal.title}</p>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {deal.stage}
                  </Badge>
                  {deal.amount && (
                    <p className="text-xs font-semibold">${deal.amount.toLocaleString()}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
