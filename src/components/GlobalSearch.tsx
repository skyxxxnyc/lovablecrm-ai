import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, Building2, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  if (!open) return null;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({
    contacts: [],
    companies: [],
    deals: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchRecentSearches();
    }
  }, [open]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults({ contacts: [], companies: [], deals: [] });
    }
  }, [query]);

  const fetchRecentSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('search_history')
        .select('query')
        .eq('user_id', user.id)
        .order('searched_at', { ascending: false })
        .limit(5);

      setRecentSearches(data?.map(d => d.query) || []);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    }
  };

  const performSearch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const searchTerm = `%${query}%`;

      // Search contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email, position')
        .eq('user_id', user.id)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(5);

      // Search companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, industry')
        .eq('user_id', user.id)
        .ilike('name', searchTerm)
        .limit(5);

      // Search deals
      const { data: deals } = await supabase
        .from('deals')
        .select('id, title, stage, amount')
        .eq('user_id', user.id)
        .ilike('title', searchTerm)
        .limit(5);

      setResults({
        contacts: contacts || [],
        companies: companies || [],
        deals: deals || [],
      });

      // Log search
      await supabase.from('search_history').insert({
        user_id: user.id,
        query,
        results_count: (contacts?.length || 0) + (companies?.length || 0) + (deals?.length || 0),
      });
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const handleResultClick = (type: string, id: string) => {
    navigate(`/?${type}=${id}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search contacts, companies, deals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          {query.length <= 2 && recentSearches.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    className="flex items-center gap-2 w-full p-2 hover:bg-accent rounded-lg text-left"
                    onClick={() => setQuery(search)}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length > 2 && (
            <div className="p-4 space-y-4">
              {results.contacts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contacts</h3>
                  <div className="space-y-1">
                    {results.contacts.map((contact: any) => (
                      <button
                        key={contact.id}
                        className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg text-left"
                        onClick={() => handleResultClick('contact', contact.id)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.position || contact.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.companies.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Companies</h3>
                  <div className="space-y-1">
                    {results.companies.map((company: any) => (
                      <button
                        key={company.id}
                        className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg text-left"
                        onClick={() => handleResultClick('company', company.id)}
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{company.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{company.industry}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.deals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Deals</h3>
                  <div className="space-y-1">
                    {results.deals.map((deal: any) => (
                      <button
                        key={deal.id}
                        className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg text-left"
                        onClick={() => handleResultClick('deal', deal.id)}
                      >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deal.stage} • ${deal.amount?.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.length > 2 && 
               results.contacts.length === 0 && 
               results.companies.length === 0 && 
               results.deals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
};
