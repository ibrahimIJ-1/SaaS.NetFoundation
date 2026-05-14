'use client';

import { useState } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Activity, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions, useTransactionStats } from '@/hooks/use-workflows';
import { useCurrencies } from '@/hooks/use-currencies';
import { StartTransactionModal } from '@/components/transactions/start-transaction-modal';
import { TransactionListItem, TransactionStatus } from '@/types/workflow';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: React.ElementType }> = {
  Active:    { label: 'نشطة',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: Clock },
  Completed: { label: 'مكتملة',  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  Cancelled: { label: 'ملغاة',   color: 'bg-red-500/10 text-red-400 border-red-500/20',         icon: XCircle },
};

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && (
        <p className={cn('text-xs mt-1', positive === undefined ? 'text-muted-foreground' : positive ? 'text-emerald-400' : 'text-red-400')}>
          {sub}
        </p>
      )}
    </div>
  );
}

function TransactionCard({ tx, currencies }: { tx: TransactionListItem; currencies?: any[] }) {
  const currency = currencies?.find(c => c.id === tx.currencyId);
  const symbol = currency?.symbol || '';
  const cfg = statusConfig[tx.status];
  const Icon = cfg.icon;
  const progressPct = tx.totalSteps > 0 ? Math.round((tx.completedSteps / tx.totalSteps) * 100) : 0;
  const netProfit = tx.actualPrice - tx.totalActualExpenses;

  return (
    <Link href={`/transactions/${tx.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-5 hover:border-legal-gold/40 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">{tx.transactionNumber}</p>
            <h3 className="font-semibold text-foreground group-hover:text-legal-gold transition-colors">{tx.contactName}</h3>
            <p className="text-xs text-muted-foreground">{tx.workflowName}</p>
          </div>
          <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0', cfg.color)}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{tx.currentStepName ?? 'جميع الخطوات مكتملة'}</span>
            <span>{tx.completedSteps}/{tx.totalSteps}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-legal-gold rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-3 gap-2 text-xs border-t border-border pt-3">
          <div>
            <p className="text-muted-foreground">السعر</p>
            <p className="font-semibold text-foreground">{tx.actualPrice.toLocaleString('ar-IQ')} {symbol}</p>
          </div>
          <div>
            <p className="text-muted-foreground">المصاريف</p>
            <p className="font-semibold text-amber-400">{tx.totalActualExpenses.toLocaleString('ar-IQ')} {symbol}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الصافي</p>
            <p className={cn('font-bold', netProfit >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {netProfit.toLocaleString('ar-IQ')} {symbol}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TransactionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  const { data: transactions, isLoading, error } = useTransactions(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  const { data: stats } = useTransactionStats();
  const { data: currencies } = useCurrencies();
  
  const baseSymbol = currencies?.find(c => c.isBase)?.symbol || '';

  const filtered = transactions?.filter((t) =>
    t.contactName.includes(search) ||
    t.transactionNumber.includes(search) ||
    t.workflowName.includes(search)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">المعاملات</h1>
          <p className="text-muted-foreground mt-1">متابعة وإدارة جميع المعاملات الإدارية والقانونية.</p>
        </div>
        <Button
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          معاملة جديدة
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="المعاملات النشطة" value={stats.active.toString()} />
          <StatCard label="المعاملات المكتملة" value={stats.completed.toString()} />
          <StatCard
            label="إجمالي الإيرادات"
            value={`${stats.totalRevenue.toLocaleString('ar-IQ')} ${baseSymbol}`}
          />
          <StatCard
            label="صافي الربح"
            value={`${stats.netProfit.toLocaleString('ar-IQ')} ${baseSymbol}`}
            sub={`مصاريف: ${stats.totalExpenses.toLocaleString('ar-IQ')} ${baseSymbol}`}
            positive={stats.netProfit >= 0}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الموكل أو رقم المعاملة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? '')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="Active">نشطة</SelectItem>
            <SelectItem value="Completed">مكتملة</SelectItem>
            <SelectItem value="Cancelled">ملغاة</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/transactions/workflows">
          <Button variant="outline">إدارة قوالب الإجراءات</Button>
        </Link>
        <Link href="/transactions/currencies">
          <Button variant="outline">إدارة العملات</Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-legal-gold" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          حدث خطأ أثناء تحميل المعاملات.
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border border-border border-dashed">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد معاملات مطابقة.</p>
          <Button
            className="mt-4 bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 ml-2" />
            فتح معاملة جديدة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered?.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} currencies={currencies} />
          ))}
        </div>
      )}

      <StartTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(id) => router.push(`/transactions/${id}`)}
      />
    </div>
  );
}
