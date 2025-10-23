import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, AlertCircle, TrendingDown, UserX, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface Suggestion {
  id: string;
  suggestion_type: 'overdue_task' | 'stuck_deal' | 'inactive_contact' | 'next_action';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

type UnifiedItem = (Notification & { itemType: 'notification' }) | (Suggestion & { itemType: 'suggestion' });

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchSuggestions();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        const newNotif = payload.new as Notification;
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.ico'
          });
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_suggestions' 
      }, (payload) => {
        const newSuggestion = payload.new as Suggestion;
        setSuggestions(prev => [newSuggestion, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      updateUnreadCount(data, suggestions);
    }
  };

  const fetchSuggestions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setSuggestions(data as Suggestion[]);
      updateUnreadCount(notifications, data as Suggestion[]);
    }
  };

  const updateUnreadCount = (notifs: Notification[], suggList: Suggestion[]) => {
    const unreadNotifs = notifs.filter(n => !n.read).length;
    const unreadSuggs = suggList.length;
    setUnreadCount(unreadNotifs + unreadSuggs);
  };

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      updateUnreadCount(
        notifications.map(n => n.id === id ? { ...n, read: true } : n),
        suggestions
      );
    }
  };

  const handleDismissSuggestion = async (id: string) => {
    const { error } = await supabase
      .from('chat_suggestions')
      .update({ dismissed: true })
      .eq('id', id);

    if (!error) {
      setSuggestions(prev => prev.filter(s => s.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Mark all notifications as read
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    // Dismiss all suggestions
    await supabase
      .from('chat_suggestions')
      .update({ dismissed: true })
      .eq('user_id', user.id)
      .eq('dismissed', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setSuggestions([]);
    setUnreadCount(0);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Navigate to dashboard and potentially trigger chat with this suggestion
    navigate(`/?suggestion=${encodeURIComponent(suggestion.title)}`);
    setOpen(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'overdue_task':
        return <AlertCircle className="h-4 w-4" />;
      case 'stuck_deal':
        return <TrendingDown className="h-4 w-4" />;
      case 'inactive_contact':
        return <UserX className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const allItems: UnifiedItem[] = [
    ...notifications.map(n => ({ ...n, itemType: 'notification' as const })),
    ...suggestions.map(s => ({ ...s, itemType: 'suggestion' as const }))
  ].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive browser notifications",
        });
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={requestNotificationPermission}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications or suggestions
            </div>
          ) : (
            <div className="divide-y">
              {allItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    item.itemType === 'notification' && !(item as Notification).read ? 'bg-muted/30' : ''
                  } ${item.itemType === 'suggestion' ? 'bg-accent/20' : ''}`}
                >
                  <div className="flex gap-3">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (item.itemType === 'notification') {
                          handleNotificationClick(item as Notification);
                        } else {
                          handleSuggestionClick(item as Suggestion);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.itemType === 'suggestion' && getSuggestionIcon((item as Suggestion).suggestion_type)}
                          <p className="text-sm font-medium">{item.title}</p>
                        </div>
                        {item.itemType === 'notification' && !(item as Notification).read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.itemType === 'notification' ? (item as Notification).message : (item as Suggestion).description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={item.itemType === 'notification' ? 'outline' : getPriorityColor((item as Suggestion).priority)}
                          className="text-xs"
                        >
                          {item.itemType === 'notification' ? (item as Notification).type : (item as Suggestion).suggestion_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {item.itemType === 'notification' && !(item as Notification).read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMarkAsRead(item.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          if (item.itemType === 'notification') {
                            handleDelete(item.id);
                          } else {
                            handleDismissSuggestion(item.id);
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};