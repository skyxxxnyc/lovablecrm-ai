import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Mail, Phone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";
import MobileFAB from "@/components/mobile/MobileFAB";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import SwipeableListItem from "@/components/mobile/SwipeableListItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/forms/ContactForm";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  company_id: string | null;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactsError) throw contactsError;

      const { data: companiesData } = await supabase
        .from("companies")
        .select("id, name");

      const companiesMap = (companiesData || []).reduce((acc, company) => {
        acc[company.id] = company;
        return acc;
      }, {} as Record<string, Company>);

      setCompanies(companiesMap);
      setContacts(contactsData || []);
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
    await fetchContacts();
    setRefreshing(false);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedContactId(undefined);
    fetchContacts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedContactId(undefined);
  };

  const handleEdit = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelectedContactId(undefined);
    setShowForm(true);
  };

  const filteredContacts = contacts.filter((contact) =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.includes(searchQuery)
  );

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default">Hot</Badge>;
    if (score >= 50) return <Badge variant="secondary">Warm</Badge>;
    return <Badge variant="outline">Cold</Badge>;
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {contact.first_name} {contact.last_name}
          </h3>
          {contact.position && (
            <p className="text-sm text-muted-foreground">{contact.position}</p>
          )}
        </div>
        {getScoreBadge(contact.engagement_score)}
      </div>
      
      <div className="space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.company_id && companies[contact.company_id] && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{companies[contact.company_id].name}</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <ResponsiveLayout>
        <div className={isMobile ? "p-0" : "p-6"}>
          {!isMobile && <Breadcrumbs items={[{ label: "Contacts" }]} />}
          
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className={isMobile ? "p-4 border-b border-border" : ""}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={isMobile ? "text-2xl font-bold flex items-center gap-2" : "text-3xl font-bold flex items-center gap-2"}>
                    <Users className={isMobile ? "h-6 w-6 text-primary" : "h-8 w-8 text-primary"} />
                    Contacts
                  </h1>
                  {!isMobile && (
                    <p className="text-muted-foreground mt-1">
                      Manage your relationships and track engagement
                    </p>
                  )}
                </div>
                {!isMobile && (
                  <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className={isMobile ? "px-4" : ""}>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
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
                      Loading contacts...
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No contacts found" : "No contacts yet"}
                      </p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <SwipeableListItem
                        key={contact.id}
                        onEdit={() => handleEdit(contact.id)}
                      >
                        <div onClick={() => navigate(`/contacts/${contact.id}`)}>
                          <ContactCard contact={contact} />
                        </div>
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
                      Loading contacts...
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No contacts found matching your search" : "No contacts yet"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContacts.map((contact) => (
                          <TableRow
                            key={contact.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/contacts/${contact.id}`)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                {contact.first_name} {contact.last_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {contact.email ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {contact.phone ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {contact.position || <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              {contact.company_id && companies[contact.company_id] ? (
                                companies[contact.company_id].name
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>{getScoreBadge(contact.engagement_score)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(contact.id);
                                }}
                              >
                                Edit
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
        <MobileFAB onNewContact={handleNew} />
      )}

      {isMobile ? (
        <Drawer open={showForm} onOpenChange={setShowForm}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedContactId ? "Edit Contact" : "New Contact"}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <ContactForm
                contactId={selectedContactId}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedContactId ? "Edit Contact" : "New Contact"}</DialogTitle>
            </DialogHeader>
            <ContactForm
              contactId={selectedContactId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
