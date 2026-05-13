'use client';

import { 
  useRevenueByMonth, 
  useCaseStats, 
  useLawyerWorkload, 
  useFinancialProjections 
} from '@/hooks/use-reports';
import { GlassCard } from '@/components/ui/glass-card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#D4AF37', '#1E293B', '#475569', '#94A3B8', '#E2E8F0'];

export default function ReportsPage() {
  const { data: revenueData } = useRevenueByMonth();
  const { data: caseStats } = useCaseStats();
  const { data: workload } = useLawyerWorkload();
  const { data: projections } = useFinancialProjections();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-legal-gold" />
            التقارير والتحليلات
          </h1>
          <p className="text-muted-foreground mt-1">نظرة شاملة على أداء المكتب المالي والمهني.</p>
        </div>
      </div>

      {/* Top Level Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-legal-gold">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground mb-1">التحصيلات المتوقعة (30 يوم)</p>
              <h4 className="text-2xl font-bold text-foreground font-mono">
                ${projections?.projectedCollections30Days.toLocaleString() ?? '0'}
              </h4>
            </div>
            <div className="p-2 bg-legal-gold/10 rounded-lg text-legal-gold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12% عن الشهر الماضي</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-slate-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground mb-1">إجمالي أموال الأمانة</p>
              <h4 className="text-2xl font-bold text-foreground font-mono">
                ${projections?.totalTrustFunds.toLocaleString() ?? '0'}
              </h4>
            </div>
            <div className="p-2 bg-slate-400/10 rounded-lg text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground mb-1">القضايا النشطة</p>
              <h4 className="text-2xl font-bold text-foreground font-mono">{caseStats?.active ?? 0}</h4>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground mb-1">معدل الإنجاز</p>
              <h4 className="text-2xl font-bold text-foreground font-mono">84%</h4>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-foreground font-heading mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-legal-gold" />
            اتجاهات الإيرادات (6 أشهر)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#D4AF37" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Case Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-foreground font-heading mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-legal-gold" />
            توزيع القضايا حسب النوع
          </h3>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseStats?.byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                  >
                    {caseStats?.byType?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-2 mt-4 md:mt-0">
              {caseStats?.byType?.map((entry: any, index: number) => (
                <div key={entry.type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.type}</span>
                  </div>
                  <span className="font-bold">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Lawyer Workload */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-foreground font-heading mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-legal-gold" />
            توزيع ضغط العمل بين المحامين
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="lawyerName" type="category" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="activeCases" name="القضايا النشطة" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="pendingTasks" name="المهام المعلقة" fill="#475569" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
