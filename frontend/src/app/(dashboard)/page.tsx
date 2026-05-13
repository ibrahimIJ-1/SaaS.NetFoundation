'use client';

import { useAuth } from '@/providers/auth-provider';
import { Briefcase, Calendar, Activity, Receipt, Clock, FileText } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusBadge } from '@/components/ui/status-badge';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 font-heading">
          مرحباً بعودتك، {user?.fullName?.split(' ')[0] || 'أستاذ'}!
        </h1>
        <p className="text-slate-400 mt-1">إليك نظرة عامة على نشاط المكتب اليوم.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي القضايا"
          value="1,248"
          icon={Briefcase}
          trend="+12% عن الشهر الماضي"
          trendUp={true}
        />

        <StatCard
          title="جلسات اليوم"
          value="8"
          icon={Calendar}
          trend="2 جلسات متبقية"
          trendUp={true}
        />

        <StatCard
          title="قضايا نشطة"
          value="86"
          icon={Activity}
          trend="+4 قضايا جديدة هذا الأسبوع"
          trendUp={true}
        />

        <StatCard
          title="الإيرادات الشهرية"
          value="$14,250"
          icon={Receipt}
          trend="+18% عن الشهر الماضي"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Hearings */}
        <GlassCard className="col-span-1 p-6">
          <h2 className="text-lg font-semibold text-slate-50 font-heading mb-4 border-b border-legal-secondary pb-3">الجلسات القادمة</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-3 rounded-lg bg-legal-secondary/30 hover:bg-legal-secondary/50 transition-colors border border-legal-secondary/50">
                <div className="w-12 h-12 rounded-full bg-legal-gold/10 flex items-center justify-center text-legal-gold mr-4 ml-4 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">محكمة الاستئناف - قضية تجارية رقم 204{i}</p>
                  <div className="flex items-center text-xs text-slate-400 mt-1">
                    <Briefcase className="w-3 h-3 ml-1" />
                    <span>الموكل: شركة الأفق</span>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-sm font-medium text-slate-300 flex items-center justify-end">
                    <Clock className="w-3 h-3 ml-1 text-legal-gold" />
                    10:{i}0 ص
                  </p>
                  <StatusBadge status="Pending" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="col-span-1 p-6">
          <h2 className="text-lg font-semibold text-slate-50 font-heading mb-4 border-b border-legal-secondary pb-3">أحدث النشاطات</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:mr-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-legal-secondary before:to-transparent">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative flex items-center justify-between group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-legal-primary bg-legal-gold text-slate-50 shadow shrink-0 z-10"></div>
                <div className="w-[calc(100%-2rem)] p-3 rounded bg-legal-secondary/30 border border-legal-secondary/50 shadow-sm mr-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-slate-200 flex items-center">
                      {i === 1 && <FileText className="w-3 h-3 ml-1 text-legal-gold" />}
                      {i === 2 && <Receipt className="w-3 h-3 ml-1 text-legal-success" />}
                      {i === 3 && <Briefcase className="w-3 h-3 ml-1 text-slate-400" />}
                      {i === 1 ? 'إضافة مستند جديد' : i === 2 ? 'دفعة مستلمة' : 'تحديث حالة قضية'}
                    </div>
                    <time className="text-xs text-slate-500 font-medium">منذ {i * 15} دقيقة</time>
                  </div>
                  <div className="text-sm text-slate-400">
                    {i === 1 ? 'تمت إضافة "عقد التأسيس.pdf" إلى القضية 2045.' : 
                     i === 2 ? 'تم استلام دفعة بقيمة $500 من الموكل أحمد.' : 
                     'تم تغيير حالة القضية العمالية إلى "نشط".'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
