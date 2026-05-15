'use client';

import { useState } from 'react';
import { Mic, Loader2, CheckCircle, XCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { voiceRecordingService } from '@/services/voice-recording.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { VoiceRecording } from '@/types/case';

interface RecordingsListProps {
  recordings: VoiceRecording[];
  onTranscribe?: (id: string) => void;
  className?: string;
}

const statusConfig = {
  Pending: { icon: Clock, label: 'في الانتظار', color: 'text-yellow-400 bg-yellow-500/10' },
  Processing: { icon: Loader2, label: 'قيد المعالجة', color: 'text-blue-400 bg-blue-500/10' },
  Completed: { icon: CheckCircle, label: 'مكتمل', color: 'text-green-400 bg-green-500/10' },
  Failed: { icon: XCircle, label: 'فشل', color: 'text-red-400 bg-red-500/10' },
};

export function RecordingsList({ recordings, onTranscribe, className }: RecordingsListProps) {
  const [transcribingId, setTranscribingId] = useState<string | null>(null);

  const handleTranscribe = async (id: string) => {
    setTranscribingId(id);
    try {
      await voiceRecordingService.transcribe(id);
      toast.success('تمت إضافة مهمة التفريغ النصي. سيتم إنشاء ملاحظة عند اكتمالها.');
      if (onTranscribe) onTranscribe(id);
    } catch (err: any) {
      toast.error(err?.response?.data || 'فشل بدء التفريغ النصي.');
    } finally {
      setTranscribingId(null);
    }
  };

  if (!recordings.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold text-foreground mb-2 font-heading">التسجيلات الصوتية</h4>
      {recordings.map((rec) => {
        const StatusIcon = statusConfig[rec.transcriptionStatus].icon;
        return (
          <div
            key={rec.id}
            className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 bg-legal-gold/10 rounded-full text-legal-gold shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{rec.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                    statusConfig[rec.transcriptionStatus].color
                  )}>
                    <StatusIcon className={cn("w-3 h-3", rec.transcriptionStatus === 'Processing' && 'animate-spin')} />
                    {statusConfig[rec.transcriptionStatus].label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(rec.recordedAt).toLocaleString('ar')}
                  </span>
                  {rec.transcriptionStatus === 'Completed' && (
                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      تم إنشاء ملاحظة
                    </span>
                  )}
                </div>
                {rec.errorMessage && (
                  <p className="text-xs text-red-400 mt-1">{rec.errorMessage}</p>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {(rec.transcriptionStatus === 'Pending' || rec.transcriptionStatus === 'Failed') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-legal-gold/30 text-legal-gold hover:bg-legal-gold/10"
                  onClick={() => handleTranscribe(rec.id)}
                  disabled={transcribingId === rec.id}
                >
                  {transcribingId === rec.id ? (
                    <Loader2 className="w-3 h-3 animate-spin ml-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 ml-1" />
                  )}
                  تفريغ نصي
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
