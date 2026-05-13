'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, Volume2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services/ai.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export function VoiceRecorder({ onTranscription, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('بدأ تسجيل الصوت...');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('فشل الوصول إلى الميكروفون.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const { transcription } = await aiService.transcribeVoice(blob);
      onTranscription(transcription);
      toast.success('تم تحويل الصوت إلى نص بنجاح!');
    } catch (err) {
      console.error('Transcription error:', err);
      toast.error('فشل تحويل الصوت إلى نص.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!isRecording ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={startRecording}
          disabled={isProcessing}
          className="h-10 w-10 rounded-full border-legal-gold/30 hover:border-legal-gold hover:bg-legal-gold/5 text-legal-gold transition-all duration-300"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-legal-danger/10 border border-legal-danger/20 rounded-full px-4 py-1 animate-pulse">
          <div className="flex gap-1 items-center">
             <div className="w-1 h-3 bg-legal-danger rounded-full animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1 h-5 bg-legal-danger rounded-full animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1 h-4 bg-legal-danger rounded-full animate-bounce" />
          </div>
          <span className="text-[10px] font-bold text-legal-danger uppercase tracking-tighter">Recording</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="h-8 w-8 rounded-full text-legal-danger hover:bg-legal-danger/20"
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
        </div>
      )}
      
      {isProcessing && (
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 animate-pulse">
          <Wand2 className="w-3 h-3 text-legal-gold" />
          جاري المعالجة بالذكاء الاصطناعي...
        </span>
      )}
    </div>
  );
}
