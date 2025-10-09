import { useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { SmartSuggestions } from "./chat/SmartSuggestions";
import { ContactCard } from "./chat/ContactCard";
import { TaskCard } from "./chat/TaskCard";
import { DealCard } from "./chat/DealCard";
import { CompanyCard } from "./chat/CompanyCard";
import { Send, Paperclip, Image as ImageIcon, Loader2, RefreshCw, Mail, FileText, Sparkles, Mic, MicOff, PhoneCall, PhoneOff } from "lucide-react";
import { useState } from "react";
interface ChatInterfaceProps {
  user: User | null;
  onContactCreated?: (contactId: string) => void;
  onContactSelect?: (contactId: string) => void;
  onDealSelect?: (dealId: string) => void;
  onCompanySelect?: (companyId: string) => void;
}
const promptSuggestions = [{
  text: "Show me all my contacts",
  icon: FileText
}, {
  text: "Show me my tasks",
  icon: Mail
}, {
  text: "Show me my deals",
  icon: FileText
}, {
  text: "Show me my companies",
  icon: Sparkles
}];
const ChatInterface = ({
  user,
  onContactCreated,
  onContactSelect,
  onDealSelect,
  onCompanySelect
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("there");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const {
    messages,
    isLoading,
    sendMessage
  } = useStreamingChat({
    user,
    onError: error => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    },
    onOpenDetail: (entityType, entityId) => {
      if (entityType === 'contact' && onContactSelect) {
        onContactSelect(entityId);
      } else if (entityType === 'deal' && onDealSelect) {
        onDealSelect(entityId);
      } else if (entityType === 'company' && onCompanySelect) {
        onCompanySelect(entityId);
      }
    }
  });
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  } = useVoiceInput();
  const voiceConversation = useVoiceConversation();
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data
      } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();
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
    if (!textToSend.trim()) return;
    setInput("");
    await sendMessage(textToSend);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleVoiceInput = async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        setInput(text);
        toast({
          title: "Transcription Complete",
          description: "Voice input transcribed successfully"
        });
      }
    } else {
      await startRecording();
      toast({
        title: "Recording",
        description: "Speak now..."
      });
    }
  };
  return <div className="flex flex-col h-full bg-[hsl(var(--chat-bg))]">
      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Voice Conversation Indicator */}
          {voiceConversation.isActive && <div className="flex justify-center mb-6">
              <div className="bg-primary/10 border border-primary/20 rounded-full px-6 py-3 flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${voiceConversation.isRecording ? 'bg-red-500 animate-pulse' : voiceConversation.isSpeaking ? 'bg-blue-500 animate-pulse' : voiceConversation.isThinking ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-sm font-medium">
                  {voiceConversation.isRecording ? 'Listening...' : voiceConversation.isThinking ? 'Thinking...' : voiceConversation.isSpeaking ? 'Speaking...' : 'Voice Active'}
                </span>
              </div>
            </div>}

          {messages.length === 0 && !voiceConversation.isActive ? <div className="flex flex-col justify-center min-h-[calc(100vh-300px)]">
              <div className="text-left mb-12 space-y-3">
                <h1 className="text-5xl font-bold tracking-tight">
                  hi there, <span className="text-primary">{userName}</span>
                </h1>
                <p className="text-right text-2xl font-bold text-[#b4b123]">
                  today is thursday, october 9th
                </p>
                <h2 className="text-4xl font-bold tracking-tight">
                  What would you <span className="text-[#5856D6]">like to know?</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-4">
                  Use one of the most common prompts below or use your own to begin
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {promptSuggestions.map((suggestion, index) => <Card key={index} onClick={() => handleSend(suggestion.text)} className="p-4 md:p-6 cursor-pointer hover:bg-secondary/50 transition-all border border-border aspect-square flex flex-col justify-between items-start min-h-[120px] md:min-h-0">
                    <p className="text-sm leading-snug text-left">{suggestion.text}</p>
                    <suggestion.icon className="h-5 w-5 text-muted-foreground mt-auto" />
                  </Card>)}
              </div>

              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground self-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Prompts
              </Button>
            </div> : <div className="space-y-6 py-8">
              {messages.map((message, index) => <div key={index} className="space-y-4">
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  
                  {/* Render structured data */}
                  {message.type === 'contacts_list' && message.data && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {message.data.map((contact: any) => <ContactCard key={contact.id} contact={contact} onSelect={onContactCreated} />)}
                    </div>}
                  
                  {message.type === 'tasks_list' && message.data && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {message.data.map((task: any) => <TaskCard key={task.id} task={task} />)}
                    </div>}
                  
                  {message.type === 'deals_list' && message.data && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {message.data.map((deal: any) => <DealCard key={deal.id} deal={deal} />)}
                    </div>}
                  
                  {message.type === 'companies_list' && message.data && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {message.data.map((company: any) => <CompanyCard key={company.id} company={company} />)}
                    </div>}
                </div>)}
              {isLoading && <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>}
            </div>}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Smart Suggestions */}
          {user && <div className="mb-4">
              <SmartSuggestions userId={user.id} onSuggestionClick={text => handleSend(text)} recentMessages={messages} />
            </div>}
          
          <div className="relative bg-background rounded-2xl border border-border">
            <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={voiceConversation.isActive ? "Voice conversation active - use the phone button to talk" : "Ask whatever you want..."} className="min-h-[80px] border-0 resize-none pr-36 focus-visible:ring-0 rounded-2xl" rows={1} disabled={voiceConversation.isActive} />
            <div className="absolute bottom-3 left-4 flex items-center space-x-2">
              {/* Voice Conversation Toggle */}
              <Button variant={voiceConversation.isActive ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => {
              if (voiceConversation.isActive) {
                voiceConversation.endConversation();
              } else {
                voiceConversation.startConversation();
              }
            }}>
                {voiceConversation.isActive ? <PhoneOff className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
              </Button>

              {voiceConversation.isActive ? <Button variant="ghost" size="icon" className={`h-8 w-8 ${voiceConversation.isRecording ? 'text-red-500' : 'text-muted-foreground'}`} onClick={voiceConversation.handleVoiceInput} disabled={voiceConversation.isProcessing || voiceConversation.isSpeaking || voiceConversation.isThinking}>
                  {voiceConversation.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : voiceConversation.isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                </Button> : <>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleVoiceInput} disabled={isProcessing}>
                    {isRecording ? <MicOff className="h-4 w-4 text-red-500 animate-pulse" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </>}
            </div>
            <div className="absolute bottom-3 right-3 flex items-center space-x-3">
              <span className="text-xs text-muted-foreground">
                {input.length}/1000
              </span>
              <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading || voiceConversation.isActive} size="icon" className="h-9 w-9 rounded-lg">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
    </div>;
};
export default ChatInterface;