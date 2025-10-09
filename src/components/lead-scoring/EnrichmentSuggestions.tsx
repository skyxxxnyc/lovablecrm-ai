import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnrichmentSuggestionsProps {
  entityType: 'contact' | 'company' | 'deal';
  entityId: string;
  onApply?: () => void;
}

export const EnrichmentSuggestions = ({ entityType, entityId, onApply }: EnrichmentSuggestionsProps) => {
  const [enrichments, setEnrichments] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  const fetchEnrichments = async () => {
    setLoading(true);
    try {
      const functionName = `enrich-${entityType}`;
      const payload = entityType === 'contact' 
        ? { contactId: entityId }
        : entityType === 'company'
        ? { companyId: entityId }
        : { dealId: entityId };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;
      setEnrichments(data.enrichments);
    } catch (error) {
      console.error('Error fetching enrichments:', error);
      toast.error('Failed to fetch enrichment suggestions');
    } finally {
      setLoading(false);
    }
  };

  const applyEnrichment = async (field: string, value: any) => {
    setApplying(field);
    try {
      const updates: any = {};
      
      if (entityType === 'contact') {
        if (field === 'company_name' && value) {
          // Would need to create or find company first
          updates.notes = `Suggested company: ${value}`;
        } else if (field === 'position') {
          updates.position = value;
        }
      } else if (entityType === 'company') {
        if (field === 'industry') updates.industry = value;
      } else if (entityType === 'deal') {
        if (field === 'amount' && value) updates.amount = value;
        if (field === 'probability') updates.probability = value;
      }

      const tableName = entityType === 'contact' ? 'contacts' 
        : entityType === 'company' ? 'companies' 
        : 'deals';

      const { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', entityId);

      if (error) throw error;

      toast.success(`Applied: ${field}`);
      if (onApply) onApply();
    } catch (error) {
      console.error('Error applying enrichment:', error);
      toast.error('Failed to apply suggestion');
    } finally {
      setApplying(null);
    }
  };

  const dismissEnrichment = (field: string) => {
    const newEnrichments = { ...enrichments };
    delete newEnrichments[field];
    setEnrichments(newEnrichments);
  };

  if (!enrichments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Enrichment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchEnrichments} disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Get AI Suggestions'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const suggestions = Object.entries(enrichments).filter(([_, value]) => 
    value && (typeof value !== 'object' || (Array.isArray(value) && value.length > 0))
  );

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Enrichment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No suggestions available at this time.</p>
          <Button onClick={fetchEnrichments} variant="outline" className="w-full mt-4">
            Refresh Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Enrichment Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map(([field, value]) => (
            <div key={field} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">
                    {field.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => applyEnrichment(field, value)}
                    disabled={applying === field}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => dismissEnrichment(field)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button 
          onClick={fetchEnrichments} 
          variant="outline" 
          className="w-full mt-4"
          disabled={loading}
        >
          Refresh Suggestions
        </Button>
      </CardContent>
    </Card>
  );
};
