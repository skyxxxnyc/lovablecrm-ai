import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Send,
  FileText,
  CheckSquare,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DealDetailPanelProps {
  dealId: string;
  onClose: () => void;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  notes: string | null;
  contact_id: string | null;
  company_id: string | null;
  contacts?: {
    first_name: string;
    last_name: string;
  };
  companies?: {
    name: string;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
}

const DealDetailPanel = ({ dealId, onClose }: DealDetailPanelProps) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDealDetails();
  }, [dealId]);

  const fetchDealDetails = async () => {
    setLoading(true);
    
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('*, contacts(first_name, last_name), companies(name)')
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive",
      });
      return;
    }

    setDeal(dealData);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    setTasks(taskData || []);
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const { error } = await supabase
      .from('deals')
      .update({ notes: newNote })
      .eq('id', dealId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Note saved successfully",
    });
    
    if (deal) {
      setDeal({ ...deal, notes: newNote });
    }
    setNewNote("");
  };

  const stageColors: Record<string, string> = {
    lead: 'bg-gray-500',
    qualified: 'bg-blue-500',
    proposal: 'bg-yellow-500',
    negotiation: 'bg-orange-500',
    closed: 'bg-green-500',
    lost: 'bg-red-500'
  };

  if (loading || !deal) {
    return (
      <aside className="w-96 border-l border-border bg-card flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-l border-border bg-card flex flex-col h-screen animate-slide-in-right">
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{deal.title}</h2>
            <Badge className={`${stageColors[deal.stage] || 'bg-gray-500'} text-white mb-2`}>
              {deal.stage}
            </Badge>
            {deal.contacts && (
              <p className="text-sm text-muted-foreground">
                {deal.contacts.first_name} {deal.contacts.last_name}
              </p>
            )}
            {deal.companies && (
              <p className="text-sm text-muted-foreground">{deal.companies.name}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {deal.amount && (
          <div className="flex items-center space-x-2 text-sm mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold">${deal.amount.toLocaleString()}</span>
          </div>
        )}

        {deal.probability !== null && (
          <div className="flex items-center space-x-2 text-sm mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>{deal.probability}% probability</span>
          </div>
        )}

        {deal.expected_close_date && (
          <div className="flex items-center space-x-2 text-sm mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Close: {new Date(deal.expected_close_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Tasks</h3>
            </div>
            {tasks.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{task.status}</p>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Notes</h3>
            </div>
            {deal.notes && (
              <Card className="p-3 mb-3 bg-secondary/50">
                <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
              </Card>
            )}
            <Card className="p-3">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] mb-2 border-0 p-0 focus-visible:ring-0 shadow-none resize-none"
              />
              <Button 
                onClick={handleSaveNote}
                size="sm" 
                className="w-full"
                disabled={!newNote.trim()}
              >
                <Send className="mr-2 h-3 w-3" />
                Save Note
              </Button>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default DealDetailPanel;
