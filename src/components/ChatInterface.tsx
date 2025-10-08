import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  User2,
  Mail,
  FileText,
  Sparkles
} from "lucide-react";

interface ChatInterfaceProps {
  user: User | null;
  onContactCreated?: (contactId: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const promptSuggestions = [
  {
    text: "Write a to-do list for a personal project or task",
    icon: FileText,
  },
  {
    text: "Generate an email reply to a job offer",
    icon: Mail,
  },
  {
    text: "Summarise this article or text for me in one paragraph",
    icon: FileText,
  },
  {
    text: "How does AI work in a technical capacity",
    icon: Sparkles,
  },
];

const ChatInterface = ({ user, onContactCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("there");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();
      
      if (data?.full_name) {
        const firstName = data.full_name.split(' ')[0];
        setUserName(firstName);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('crm-chat', {
        body: { 
          messages: [...messages, userMessage],
          userId: user?.id 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.message 
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (data.contactId && onContactCreated) {
        onContactCreated(data.contactId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--chat-bg))]">
      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center min-h-[calc(100vh-300px)]">
              <div className="text-left mb-12 space-y-3">
                <h1 className="text-5xl font-bold tracking-tight">
                  Hi there, <span className="text-primary">{userName}</span>
                </h1>
                <h2 className="text-4xl font-bold tracking-tight">
                  What would <span className="text-[#5856D6]">like to know?</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-4">
                  Use one of the most common prompts below or use your own to begin
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                {promptSuggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    onClick={() => handleSend(suggestion.text)}
                    className="p-6 cursor-pointer hover:bg-secondary/50 transition-all border border-border aspect-square flex flex-col justify-between items-start"
                  >
                    <p className="text-sm leading-snug text-left">{suggestion.text}</p>
                    <suggestion.icon className="h-5 w-5 text-muted-foreground mt-auto" />
                  </Card>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground self-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Prompts
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card p-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-background rounded-2xl border border-border">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask whatever you want..."
              className="min-h-[80px] border-0 resize-none pr-36 focus-visible:ring-0 rounded-2xl"
              rows={1}
            />
            <div className="absolute bottom-3 left-4 flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center space-x-3">
              <span className="text-xs text-muted-foreground">
                {input.length}/1000
              </span>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-9 w-9 rounded-lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              All Web
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
