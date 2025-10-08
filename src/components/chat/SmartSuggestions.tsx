import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingDown, UserX, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  suggestion_type: 'overdue_task' | 'stuck_deal' | 'inactive_contact' | 'next_action';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  entity_type?: string;
  entity_id?: string;
}

interface SmartSuggestionsProps {
  userId: string;
  onSuggestionClick?: (text: string) => void;
}

export const SmartSuggestions = ({ userId, onSuggestionClick }: SmartSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Generate fresh suggestions
      await supabase.rpc('generate_smart_suggestions', { p_user_id: userId });

      // Fetch suggestions
      const { data, error } = await supabase
        .from('chat_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('dismissed', false)
        .order('priority', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSuggestions((data || []) as Suggestion[]);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [userId]);

  const dismissSuggestion = async (id: string) => {
    try {
      await supabase
        .from('chat_suggestions')
        .update({ dismissed: true })
        .eq('id', id);

      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue_task':
        return <AlertCircle className="h-4 w-4" />;
      case 'stuck_deal':
        return <TrendingDown className="h-4 w-4" />;
      case 'inactive_contact':
        return <UserX className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'medium':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Smart Suggestions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSuggestions}
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            className={`p-3 border cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className="flex-1"
                onClick={() => {
                  if (onSuggestionClick) {
                    onSuggestionClick(`Tell me more about: ${suggestion.title}`);
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(suggestion.suggestion_type)}
                  <p className="font-medium text-sm">{suggestion.title}</p>
                </div>
                <p className="text-xs opacity-80">{suggestion.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissSuggestion(suggestion.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
