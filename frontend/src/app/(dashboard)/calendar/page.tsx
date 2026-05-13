"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar as CalendarIcon, Plus, Filter, Clock, MapPin, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCalendarEvents } from "@/hooks/use-calendar";

import { CalendarWidget } from "@/components/calendar/calendar-widget";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const { data: events, isLoading } = useCalendarEvents(
    dateRange.start.toISOString(),
    dateRange.end.toISOString()
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = events?.find(e => e.id === selectedEventId);

  const mappedEvents = events?.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.isAllDay,
    backgroundColor: 
      e.type === 'Session' ? '#D4AF37' : 
      e.type === 'Deadline' ? '#EF4444' : 
      e.type === 'Meeting' ? '#3B82F6' : '#22C55E',
    borderColor: 'transparent',
    textColor: e.type === 'Session' ? '#1E293B' : '#FFFFFF',
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-legal-gold" />
            التقويم القانوني
          </h1>
          <p className="text-muted-foreground mt-1">متابعة الجلسات، المواعيد النهائية، والمهام.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            تصفية
          </Button>
          <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold gap-2">
            <Plus className="w-4 h-4" />
            إضافة موعد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <GlassCard className="xl:col-span-3 p-4 bg-card/50">
          <CalendarWidget 
            events={mappedEvents} 
            onDatesSet={(info) => setDateRange({ start: info.start, end: info.end })}
            onEventClick={(info) => setSelectedEventId(info.event.id)}
          />
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-foreground font-heading mb-4 border-b border-border pb-2">
              تفاصيل الموعد
            </h3>
            {selectedEvent ? (
              <div className="space-y-4 animate-in slide-in-from-left duration-300">
                <div>
                  <div className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2",
                    selectedEvent.type === 'Session' ? "bg-legal-gold/20 text-legal-gold" :
                    selectedEvent.type === 'Deadline' ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    {selectedEvent.type === 'Session' ? 'جلسة محكمة' : 
                     selectedEvent.type === 'Deadline' ? 'موعد نهائي' : 'اجتماع'}
                  </div>
                  <h4 className="text-xl font-bold text-foreground leading-tight">{selectedEvent.title}</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-legal-gold" />
                    <span>{format(new Date(selectedEvent.start), 'eeee, d MMMM yyyy', { locale: ar })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-legal-gold" />
                    <span>قاعة 4 - محكمة البداية</span>
                  </div>
                </div>

                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg border border-border">
                    {selectedEvent.description}
                  </p>
                )}

                {selectedEvent.legalCaseId && (
                  <Link href={`/cases/${selectedEvent.legalCaseId}`}>
                    <Button variant="outline" className="w-full mt-4 gap-2 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                      عرض ملف القضية
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 opacity-40">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">حدد موعداً من التقويم لعرض التفاصيل</p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 border-legal-gold/20 bg-legal-gold/5">
            <h3 className="font-bold text-legal-gold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              تنبيهات هامة
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs font-bold text-red-400 mb-1">تعارض في المواعيد!</p>
                <p className="text-[10px] text-red-400/80">هناك جلستان مجدولتان في نفس الوقت اليوم الساعة 10:00 صباحاً.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
