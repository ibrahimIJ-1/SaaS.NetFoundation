import * as React from "react";
import { useState } from "react";
import { useAddCaseNote } from "@/hooks/use-cases";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/ui/rich-editor";
import { toast } from "sonner";
import { Send } from "lucide-react";


import { VoiceRecorder } from "@/components/ui/voice-recorder";

export function AddNoteForm({ caseId }: { caseId: string }) {
  const [noteText, setNoteText] = useState("");
  const addNote = useAddCaseNote();

  const handleTranscription = (text: string) => {
    setNoteText(prev => prev ? `${prev}\n${text}` : text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addNote.mutate(
      { id: caseId, noteText },
      {
        onSuccess: () => {
          setNoteText("");
          toast.success("تمت إضافة الملاحظة بنجاح");
        },
        onError: () => {
          toast.error("حدث خطأ أثناء إضافة الملاحظة");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-secondary/20 rounded-xl border border-border">
      <h4 className="text-sm font-semibold text-foreground mb-3 font-heading">إضافة ملاحظة جديدة</h4>
      <div className="mb-4">
        <RichEditor
          value={noteText}
          onChange={setNoteText}
          placeholder="اكتب ملاحظتك هنا أو استخدم الميكروفون للإملاء..."
        />
      </div>

      <div className="flex justify-between items-center">
        <VoiceRecorder onTranscription={handleTranscription} />
        <Button 
          type="submit" 
          disabled={!noteText.trim() || addNote.isPending}
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
        >
          {addNote.isPending ? "جاري الإضافة..." : (
            <>
              <Send className="w-4 h-4 ml-2" />
              إضافة الملاحظة
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
