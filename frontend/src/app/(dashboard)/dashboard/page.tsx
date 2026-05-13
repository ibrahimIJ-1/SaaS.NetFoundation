"use client";

import { useAuth } from "@/providers/auth-provider";
import {
  Briefcase,
  Calendar,
  Activity,
  Receipt,
  Clock,
  FileText,
  CheckSquare,
  AlertCircle,
  Navigation2,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { useTasks, useCalendarEvents } from "@/hooks/use-calendar";
import { useDashboardSummary } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { arEG } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: statsLoading } = useDashboardSummary();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const { data: calendarEvents } = useCalendarEvents(todayStart.toISOString(), todayEnd.toISOString());
  const { data: tasks } = useTasks();

  const todaySessions = calendarEvents?.filter(e => e.type === 'Session') ?? [];
  const pendingTasks = tasks?.filter(t => !t.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5) ?? [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-legal-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          مرحباً بعودتك، {user?.fullName?.split(" ")[0] || "أستاذ"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          إليك نظرة عامة على نشاط المكتب اليوم.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي القضايا"
          value={summary?.totalCases.toLocaleString() || "0"}
          icon={Briefcase}
          trend={summary?.casesTrend || "قيد التحديث..."}
          trendUp={true}
        />
        <StatCard
          title="جلسات اليوم"
          value={todaySessions.length.toString()}
          icon={Calendar}
          trend={todaySessions.length > 0 ? `${todaySessions.filter(e => !e.hasConflict).length} بدون تعارض` : "لا توجد جلسات اليوم"}
          trendUp={todaySessions.length === 0}
        />
        <StatCard
          title="قضايا نشطة"
          value={summary?.activeCases.toString() || "0"}
          icon={Activity}
          trend="نشطة حالياً في المكتب"
          trendUp={true}
        />
        <StatCard
          title="إيرادات الشهر"
          value={`$${summary?.monthlyRevenue.toLocaleString() || "0"}`}
          icon={Receipt}
          trend={summary?.revenueTrend || "قيد التحديث..."}
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Sessions - Live from Dashboard Summary */}
        <GlassCard className="col-span-1 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-foreground font-heading">الجلسات القادمة</h2>
            <Link href="/calendar" className="text-xs text-legal-gold hover:underline">عرض التقويم</Link>
          </div>
          <div className="space-y-4">
            {!summary?.upcomingSessions.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد جلسات قادمة مجدولة.</p>
            ) : (
              summary.upcomingSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-legal-gold/10 flex items-center justify-center text-legal-gold mr-4 ml-4 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.courtName} - {session.caseTitle}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Briefcase className="w-3 h-3 ml-1" />
                      <span>الموكل: {session.clientName}</span>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-medium text-foreground/80 flex items-center justify-end" dir="ltr">
                      <Clock className="w-3 h-3 ml-1 text-legal-gold" />
                      {new Date(session.sessionDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-muted-foreground text-left">
                      {new Date(session.sessionDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Recent Activity - Live from Dashboard Summary */}
        <GlassCard className="col-span-1 p-6">
          <h2 className="text-lg font-semibold text-foreground font-heading mb-4 border-b border-border pb-3">
            أحدث النشاطات
          </h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:mr-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {!summary?.recentActivities.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد نشاطات مؤخراً.</p>
            ) : (
              summary.recentActivities.map((activity: any, idx: number) => (
                <div
                  key={idx}
                  className="relative flex items-center justify-between group"
                >
                  <div className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-full border-2 border-background shadow shrink-0 z-10",
                    activity.type === 'Document' ? "bg-legal-gold" : 
                    activity.type === 'Payment' ? "bg-legal-success" : "bg-blue-500"
                  )}></div>
                  <div className="w-[calc(100%-2rem)] p-3 rounded bg-secondary/30 border border-border shadow-sm mr-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-foreground flex items-center">
                        {activity.type === 'Document' && (<FileText className="w-3 h-3 ml-1 text-legal-gold" />)}
                        {activity.type === 'Payment' && (<Receipt className="w-3 h-3 ml-1 text-legal-success" />)}
                        {activity.type === 'Task' && (<CheckSquare className="w-3 h-3 ml-1 text-blue-400" />)}
                        {activity.title}
                      </div>
                      <time className="text-[10px] text-muted-foreground/60 font-medium">
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: arEG })}
                      </time>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.description}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Today's Agenda — Live from API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-foreground font-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-legal-gold" />
              جلسات اليوم
            </h2>
            <Link href="/calendar" className="text-xs text-legal-gold hover:underline">التقويم الكامل</Link>
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">لا توجد جلسات مجدولة اليوم.</p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map(session => (
                <div key={session.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  session.hasConflict ? "border-legal-danger/40 bg-legal-danger/5" : "border-border bg-secondary/20"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0 mt-0.5",
                    session.hasConflict ? "bg-legal-danger" : "bg-legal-gold"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                    {session.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{session.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap" dir="ltr">
                    {new Date(session.start).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Pending Tasks */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-foreground font-heading flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              المهام العاجلة
            </h2>
            <Link href="/tasks" className="text-xs text-legal-gold hover:underline">كل المهام</Link>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">لا توجد مهام معلقة. عمل ممتاز!</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(task => {
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    isOverdue ? "border-legal-danger/40 bg-legal-danger/5" : "border-border bg-secondary/20"
                  )}>
                    {isOverdue
                      ? <AlertCircle className="w-4 h-4 text-legal-danger shrink-0" />
                      : <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className={cn(
                        "text-xs mt-0.5",
                        isOverdue ? "text-legal-danger" : "text-muted-foreground"
                      )}>
                        {isOverdue ? "متأخر: " : "الموعد: "}
                        {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      task.priority === 'Urgent' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      task.priority === 'High' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                      "bg-secondary text-muted-foreground border-border"
                    )}>
                      {task.priority === 'Urgent' ? 'حرج' : task.priority === 'High' ? 'عالي' : 'متوسط'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
