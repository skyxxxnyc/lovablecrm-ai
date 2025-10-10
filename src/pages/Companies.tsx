import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, Phone, Globe, MapPin } from "lucide-react";
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
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";
import MobileFAB from "@/components/mobile/MobileFAB";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import CompanyCard from "@/components/mobile/CompanyCard";
import SwipeableListItem from "@/components/mobile/SwipeableListItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompanies();
    setRefreshing(false);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default">High Quality</Badge>;
    if (score >= 50) return <Badge variant="secondary">Medium Quality</Badge>;
    return <Badge variant="outline">Low Quality</Badge>;
  };

  return (
    <>
      <ResponsiveLayout>
        <div className={isMobile ? "p-0" : "p-6"}>
          {!isMobile && <Breadcrumbs items={[{ label: "Companies" }]} />}
          
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className={isMobile ? "p-4 border-b border-border" : ""}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={isMobile ? "text-2xl font-bold flex items-center gap-2" : "text-3xl font-bold flex items-center gap-2"}>
                    <Building2 className={isMobile ? "h-6 w-6 text-primary" : "h-8 w-8 text-primary"} />
                    Companies
                  </h1>
                  {!isMobile && (
                    <p className="text-muted-foreground mt-1">
                      Manage your company database
                    </p>
                  )}
                </div>
                {!isMobile && (
                  <Button onClick={() => navigate("/")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className={isMobile ? "px-4" : ""}>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Content */}
            {isMobile ? (
              <PullToRefresh onRefresh={handleRefresh} disabled={loading}>
                <div className="px-4 pb-20 space-y-3">
                  {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                      Loading companies...
                    </div>
                  ) : filteredCompanies.length === 0 ? (
                    <div className="py-12 text-center">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No companies found" : "No companies yet"}
                      </p>
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <SwipeableListItem
                        key={company.id}
                        onEdit={() => navigate(`/companies/${company.id}`)}
                      >
                        <CompanyCard
                          company={company}
                          onClick={() => navigate(`/companies/${company.id}`)}
                        />
                      </SwipeableListItem>
                    ))
                  )}
                </div>
              </PullToRefresh>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading companies...
                    </div>
                  ) : filteredCompanies.length === 0 ? (
                    <div className="p-8 text-center">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No companies found matching your search" : "No companies yet"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company Name</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Quality Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCompanies.map((company) => (
                          <TableRow
                            key={company.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/companies/${company.id}`)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                {company.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {company.industry || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {company.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {company.phone}
                                  </div>
                                )}
                                {company.website && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Globe className="h-3 w-3" />
                                    <a
                                      href={company.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {company.address ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  {company.address}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>{getScoreBadge(company.quality_score)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/companies/${company.id}`);
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
            )}
          </div>
        </div>
      </ResponsiveLayout>

      {isMobile && (
        <MobileFAB
          onNewCompany={() => navigate("/")}
        />
      )}
    </>
  );
}
