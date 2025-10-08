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
  User as UserIcon,
  Bot,
  Lightbulb,
  Mail,
  FileText,
  Calendar
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
    icon: UserIcon,
    text: "Create a new contact for Sarah Johnson from Acme Corp",
  },
  {
    icon: Mail,
    text: "Show me all emails from last week",
  },
  {
    icon: FileText,
    text: "Create a follow-up task for John",
  },
  {
    icon: Calendar,
    text: "Schedule a meeting with the sales team",
  },
];

const ChatInterface = ({ user, onContactCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
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

      // If a contact was created, notify parent
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

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-chat-bg">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-sm text-muted-foreground">Ask me anything about your CRM</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center space-y-8 py-12">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Hi there, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {user?.email?.split('@')[0] || 'Friend'}
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  What would you like to <span className="text-primary">know?</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {promptSuggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-4 cursor-pointer hover:shadow-elegant hover:border-primary/20 transition-all group"
                    onClick={() => handlePromptClick(suggestion.text)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <suggestion.icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {suggestion.text}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Refresh Prompts
              </Button>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-4 shadow-soft">
            <div className="flex items-end space-x-2">
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask whatever you want..."
                className="min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent"
                rows={1}
              />
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {input.length}/1000
                </span>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-9 w-9 bg-primary hover:bg-primary/90 rounded-lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
