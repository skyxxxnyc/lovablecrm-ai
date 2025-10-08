import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'contacts_list' | 'tasks_list' | 'deals_list' | 'companies_list';
  data?: any[];
}

interface UseStreamingChatProps {
  user: User | null;
  onError?: (error: string) => void;
}

export const useStreamingChat = ({ user, onError }: UseStreamingChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const contentType = response.headers.get('content-type');
      
      // Check if response is structured data (JSON)
      if (contentType?.includes('application/json')) {
        const result = await response.json();
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.message || 'Here are your results',
          type: result.type,
          data: result.data
        }]);
        return;
      }

      // Otherwise handle streaming response
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      const updateAssistantMessage = (content: string) => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant') {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content } : m
            );
          }
          return [...prev, { role: 'assistant', content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateAssistantMessage(assistantContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateAssistantMessage(assistantContent);
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error.message || 'Failed to send message';
      if (onError) {
        onError(errorMessage);
      }
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, user, onError]);

  return {
    messages,
    isLoading,
    sendMessage,
    setMessages,
  };
};
