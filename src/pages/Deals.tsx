import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Briefcase, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number | null;
  probability: number;
  probability_score: number;
  expected_close_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Company {
  id: string;
  name: string;
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Record<string, Contact>>({});
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (dealsError) throw dealsError;

      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, first_name, last_name");

      const { data: companiesData } = await supabase
        .from("companies")
        .select("id, name");

      const contactsMap = (contactsData || []).reduce((acc, contact) => {
        acc[contact.id] = contact;
        return acc;
      }, {} as Record<string, Contact>);

      const companiesMap = (companiesData || []).reduce((acc, company) => {
        acc[company.id] = company;
        return acc;
      }, {} as Record<string, Company>);

      setContacts(contactsMap);
      setCompanies(companiesMap);
      setDeals(dealsData || []);
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

  const filteredDeals = deals.filter((deal) =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Deals" }]} />
        
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              Deals
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your sales pipeline
            </p>
          </div>
          <Button onClick={() => navigate("/")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading deals...
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No deals found matching your search" : "No deals yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Title</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow
                      key={deal.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          {deal.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.contact_id && contacts[deal.contact_id] ? (
                          `${contacts[deal.contact_id].first_name} ${contacts[deal.contact_id].last_name}`
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.company_id && companies[deal.company_id] ? (
                          companies[deal.company_id].name
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(deal.amount)}
                        </div>
                      </TableCell>
                      <TableCell>{getStageBadge(deal.stage)}</TableCell>
                      <TableCell>{deal.probability}%</TableCell>
                      <TableCell>
                        {deal.expected_close_date ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(deal.expected_close_date), "MMM d, yyyy")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/deals/${deal.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </AppLayout>
  );
}
