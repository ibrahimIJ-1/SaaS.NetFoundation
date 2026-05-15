'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, Wand2, Clock, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services/ai.service';
import { voiceRecordingService } from '@/services/voice-recording.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { VoiceRecording } from '@/types/case';

const MAX_DURATION_SECONDS = 300;

interface VoiceRecorderProps {
  onTranscription?: (text: string) => void;
  onRecordingComplete?: (recording: VoiceRecording) => void;
  legalCaseId?: string;
  courtSessionId?: string;
  className?: string;
}

export function VoiceRecorder({ onTranscription, onRecordingComplete, legalCaseId, courtSessionId, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setElapsed(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('بدأ تسجيل الصوت...');

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= MAX_DURATION_SECONDS) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
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

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      if (legalCaseId) {
        const recording = await voiceRecordingService.upload(blob, `recording-${Date.now()}.webm`, legalCaseId, courtSessionId);
        if (onRecordingComplete) onRecordingComplete(recording);
        toast.success('تم رفع التسجيل بنجاح!');
      } else {
        const { transcription } = await aiService.transcribeVoice(blob);
        if (onTranscription) onTranscription(transcription);
        toast.success('تم تحويل الصوت إلى نص بنجاح!');
      }
    } catch (err) {
      console.error('Recording error:', err);
      toast.error('فشل معالجة التسجيل الصوتي.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = MAX_DURATION_SECONDS - elapsed;

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
          <span className="text-[10px] font-bold text-legal-danger uppercase tracking-tighter">
            {formatTime(elapsed)}
          </span>
          {remaining <= 30 && (
            <span className="text-[10px] text-legal-danger flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {remaining}s
            </span>
          )}
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
          <Upload className="w-3 h-3 text-legal-gold" />
          جاري الرفع والمعالجة...
        </span>
      )}
    </div>
  );
}
