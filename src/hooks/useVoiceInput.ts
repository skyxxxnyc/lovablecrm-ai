import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Send to edge function for transcription
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: formData,
          });

          if (error) throw error;

          const text = data?.text || '';
          resolve(text);
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Transcription Error",
            description: "Could not transcribe audio. Please try again.",
            variant: "destructive",
          });
          resolve(null);
        } finally {
          setIsProcessing(false);
          
          // Clean up
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          chunksRef.current = [];
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [toast]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
