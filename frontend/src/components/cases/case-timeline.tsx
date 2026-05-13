import * as React from "react";
import { useCaseTimeline } from "@/hooks/use-cases";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, FileText, Gavel, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface CaseTimelineProps {
  caseId: string;
}

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  const { data: timeline, isLoading, error } = useCaseTimeline(caseId);

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>;
  }

  if (error || !timeline) {
    return <div className="py-8 text-center text-legal-danger">حدث خطأ في تحميل السجل الزمني.</div>;
  }

  if (timeline.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">لا توجد أحداث بعد.</div>;
  }

  return (
    <div className="relative border-r-2 border-border mr-4 pr-6 space-y-8 my-6">
      {timeline.map((item, index) => {
        let Icon = Clock;
        let colorClass = "text-slate-400 bg-secondary border-border";
        let title = "";
        let desc = "";

        if (item.type === "Created") {
          Icon = FileText;
          colorClass = "text-legal-success bg-legal-success/10 border-legal-success/30";
          title = "تم فتح القضية";
          desc = item.data.message;
        } else if (item.type === "Stage") {
          Icon = Clock;
          colorClass = "text-legal-gold bg-legal-gold/10 border-legal-gold/30";
          title = `تغيير المرحلة: ${item.data.name}`;
          desc = item.data.notes || "";
        } else if (item.type === "Session") {
          Icon = Gavel;
          colorClass = "text-legal-danger bg-legal-danger/10 border-legal-danger/30";
          title = `جلسة: ${item.data.courtName}`;
          desc = item.data.notes || item.data.decision || "";
        } else if (item.type === "Note") {
          Icon = FileText;
          colorClass = "text-slate-200 bg-secondary border-border";
          title = `ملاحظة بواسطة ${item.data.authorName}`;
          desc = item.data.noteText;
        }

        return (
          <div key={index} className="relative">
            <div className={`absolute -right-10 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            
            <GlassCard className="p-4 border-border/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground font-heading">{title}</h4>
                <time className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                  {format(new Date(item.date), "dd MMMM yyyy, hh:mm a", { locale: ar })}
                </time>
              </div>
              {desc && <p className="text-sm text-muted-foreground mt-2 bg-background/50 p-3 rounded-lg border border-border/30">{desc}</p>}
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}
