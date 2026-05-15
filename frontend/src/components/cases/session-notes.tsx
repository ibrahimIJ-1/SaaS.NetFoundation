'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseService } from '@/services/case.service';
import { voiceRecordingService } from '@/services/voice-recording.service';
import { Button } from '@/components/ui/button';
import { RichEditor } from '@/components/ui/rich-editor';
import { VoiceRecorder } from '@/components/ui/voice-recorder';
import { RecordingsList } from '@/components/ui/recordings-list';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { VoiceRecording, CaseNote } from '@/types/case';

interface SessionNotesProps {
  sessionId: string;
  legalCaseId: string;
}

export function SessionNotes({ sessionId, legalCaseId }: SessionNotesProps) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['session-notes', sessionId],
    queryFn: () => caseService.getSessionNotes(sessionId),
  });

  const { data: recordings, isLoading: recordingsLoading } = useQuery({
    queryKey: ['session-recordings', sessionId],
    queryFn: () => voiceRecordingService.getBySession(sessionId),
  });

  const addNote = useMutation({
    mutationFn: (text: string) => caseService.addSessionNote(sessionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-notes', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setNoteText('');
      toast.success('تمت إضافة الملاحظة للجلسة');
    },
    onError: () => toast.error('فشل إضافة الملاحظة'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote.mutate(noteText);
  };

  return (
    <div className="space-y-4">
      {/* Notes list */}
      <div className="space-y-3">
        {notesLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-legal-gold" />
          </div>
        ) : notes?.length ? (
          notes.map((note: CaseNote) => (
            <div key={note.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-foreground text-sm">{note.authorName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(note.date).toLocaleString('ar')}
                </span>
              </div>
              <div className="text-muted-foreground text-sm rich-text-preview"
                dangerouslySetInnerHTML={{ __html: note.noteText }} />
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">
            لا توجد ملاحظات لهذه الجلسة.
          </p>
        )}
      </div>

      {/* Recordings */}
      {recordingsLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-legal-gold" />
        </div>
      ) : (
        <RecordingsList
          recordings={recordings || []}
          onDelete={() => queryClient.invalidateQueries({ queryKey: ['session-recordings', sessionId] })}
          onTranscribe={() => queryClient.invalidateQueries({ queryKey: ['session-recordings', sessionId] })}
        />
      )}

      {/* Add note form with voice recorder */}
      <form onSubmit={handleSubmit} className="border-t border-border pt-4">
        <div className="mb-3">
          <RichEditor
            value={noteText}
            onChange={setNoteText}
            placeholder="اكتب ملاحظة لهذه الجلسة..."
          />
        </div>
        <div className="flex justify-between items-center">
          <VoiceRecorder
            legalCaseId={legalCaseId}
            courtSessionId={sessionId}
            onRecordingComplete={() =>
              queryClient.invalidateQueries({ queryKey: ['session-recordings', sessionId] })
            }
          />
          <Button
            type="submit"
            disabled={!noteText.trim() || addNote.isPending}
            className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
          >
            {addNote.isPending ? 'جاري الإضافة...' : (
              <>
                <Send className="w-4 h-4 ml-2" />
                إضافة ملاحظة
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
