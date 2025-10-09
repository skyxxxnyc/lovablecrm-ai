import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AdvancedFilterBuilderProps {
  entityType: 'contacts' | 'companies' | 'deals';
  onApply: (filters: FilterCondition[]) => void;
}

export const AdvancedFilterBuilder = ({ entityType, onApply }: AdvancedFilterBuilderProps) => {
  const [conditions, setConditions] = useState<FilterCondition[]>([{
    id: '1',
    field: 'first_name',
    operator: 'equals',
    value: ''
  }]);
  const [filterName, setFilterName] = useState("");
  const [showSave, setShowSave] = useState(false);

  const fields = {
    contacts: ['first_name', 'last_name', 'email', 'phone', 'position', 'engagement_score'],
    companies: ['name', 'industry', 'website', 'quality_score'],
    deals: ['title', 'stage', 'amount', 'probability', 'probability_score']
  };

  const operators = ['equals', 'contains', 'greater_than', 'less_than', 'not_equals'];

  const addCondition = () => {
    setConditions([...conditions, {
      id: Date.now().toString(),
      field: fields[entityType][0],
      operator: 'equals',
      value: ''
    }]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleApply = () => {
    onApply(conditions);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_filters')
        .insert([{
          user_id: user.id,
          name: filterName,
          entity_type: entityType,
          filter_config: conditions as any,
        }]);

      if (error) throw error;

      toast.success('Filter saved');
      setShowSave(false);
      setFilterName("");
    } catch (error) {
      console.error('Error saving filter:', error);
      toast.error('Failed to save filter');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((condition) => (
          <div key={condition.id} className="flex items-center gap-2">
            <Select
              value={condition.field}
              onValueChange={(value) => updateCondition(condition.id, { field: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fields[entityType].map((field) => (
                  <SelectItem key={field} value={field}>
                    {field.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={condition.operator}
              onValueChange={(value) => updateCondition(condition.id, { operator: value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
              placeholder="Value"
              className="flex-1"
            />

            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeCondition(condition.id)}
              disabled={conditions.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addCondition} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>

        <div className="flex gap-2 pt-4">
          {!showSave ? (
            <>
              <Button variant="outline" onClick={() => setShowSave(true)} className="flex-1">
                Save Filter
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
            </>
          ) : (
            <>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter name"
                className="flex-1"
              />
              <Button onClick={handleSave} disabled={!filterName}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setShowSave(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
