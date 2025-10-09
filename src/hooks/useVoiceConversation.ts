import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceInput } from './useVoiceInput';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useVoiceConversation = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceInput();
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const sendToGemini = useCallback(async (userMessage: string) => {
    const newHistory = [...conversationHistory, { role: 'user' as const, content: userMessage }];
    setConversationHistory(newHistory);
    setIsThinking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newHistory }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
            }
          } catch (e) {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }

      setIsThinking(false);

      if (assistantMessage) {
        setConversationHistory([...newHistory, { role: 'assistant', content: assistantMessage }]);
        speak(assistantMessage);
      }
    } catch (error) {
      console.error('Error in voice conversation:', error);
      setIsThinking(false);
      toast.error(error instanceof Error ? error.message : 'Failed to process message');
    }
  }, [conversationHistory, speak]);

  const handleVoiceInput = useCallback(async () => {
    if (isRecording) {
      const transcript = await stopRecording();
      if (transcript) {
        await sendToGemini(transcript);
      }
    } else {
      stopSpeaking();
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, sendToGemini, stopSpeaking]);

  const startConversation = useCallback(() => {
    setIsActive(true);
    setConversationHistory([]);
    toast.success('Voice conversation started');
  }, []);

  const endConversation = useCallback(() => {
    setIsActive(false);
    stopSpeaking();
    if (isRecording) {
      stopRecording();
    }
    setConversationHistory([]);
    toast.info('Voice conversation ended');
  }, [stopSpeaking, isRecording, stopRecording]);

  return {
    isActive,
    isRecording,
    isProcessing,
    isSpeaking,
    isThinking,
    conversationHistory,
    startConversation,
    endConversation,
    handleVoiceInput,
  };
};
