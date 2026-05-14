"use client";

import {
  useFinancialStats,
  useInvoices,
  useRecentPayments,
} from "@/hooks/use-billing";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Receipt,
  TrendingUp,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  Plus,
  History,
  MessageCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { useBaseCurrency } from "@/hooks/use-base-currency";
import { InvoiceStatus } from "@/types/billing";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string }> = {
  Draft: {
    label: "مسودة",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  Sent: {
    label: "مرسلة",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  Partial: {
    label: "جزئية",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  Paid: {
    label: "مدفوعة",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  Overdue: {
    label: "متأخرة",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  Cancelled: {
    label: "ملغاة",
    color: "bg-secondary text-muted-foreground border-border",
  },
};

export default function BillingDashboard() {
  const { data: stats, isLoading: statsLoading } = useFinancialStats();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();

  const { data: payments, isLoading: paymentsLoading } = useRecentPayments();
  const baseCurrency = useBaseCurrency();
  const sym = baseCurrency?.symbol || '';
  const fmt = (v: number | undefined | null) => v ? `${v.toLocaleString()} ${sym}` : `0 ${sym}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Receipt className="w-8 h-8 text-legal-gold" />
            المالية والفواتير
          </h1>
          <p className="text-muted-foreground mt-1">
            تتبع الدفعات والمستحقات وحسابات الأمانة.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/billing/bulk">
            <Button
              variant="outline"
              className="gap-2 border-legal-gold/50 text-legal-gold hover:bg-legal-gold/10"
            >
              <Zap className="w-4 h-4" />
              الفوترة السريعة
            </Button>
          </Link>
          <Link href="/billing/invoices/new">
            <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">
              <Plus className="w-4 h-4 ml-2" />
              فاتورة جديدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={fmt(stats?.totalRevenue)}
          icon={TrendingUp}
          trend="+12% هذا الشهر"
          trendUp={true}
        />
        <StatCard
          title="مستحقات معلقة"
          value={fmt(stats?.totalOutstanding)}
          icon={AlertCircle}
          trend="من 15 فاتورة"
          trendUp={false}
        />
        <StatCard
          title="حساب الأمانة"
          value={fmt(stats?.trustBalance)}
          icon={Wallet}
          trend="رصيد الموكلين"
          trendUp={true}
        />
        <StatCard
          title="إيرادات الشهر"
          value={fmt(stats?.monthlyRevenue)}
          icon={ArrowUpRight}
          trend={`الهدف: ${fmt(20000)}`}
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-foreground font-heading">
              أحدث الفواتير
            </h2>
            <Link
              href="/billing/invoices"
              className="text-xs text-legal-gold hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">رقم الفاتورة</th>
                  <th className="pb-3 font-medium">القضية</th>
                  <th className="pb-3 font-medium">المبلغ</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 font-medium text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : (
                  invoices?.slice(0, 5).map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="py-4">
                        <Link
                          href={`/billing/invoices/${invoice.id}`}
                          className="font-semibold text-foreground hover:text-legal-gold"
                        >
                          #{invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-4">
                        <div
                          className="max-w-[150px] truncate"
                          title={invoice.legalCase?.title}
                        >
                          {invoice.legalCase?.title}
                        </div>
                      </td>
                      <td className="py-4 font-medium text-foreground">
                        {fmt(invoice.totalAmount)}
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            STATUS_CONFIG[invoice.status].color,
                          )}
                        >
                          {STATUS_CONFIG[invoice.status].label}
                        </span>
                      </td>
                      <td className="py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status !== "Paid" &&
                            invoice.legalCase?.contact?.phoneNumber && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                title="إرسال تذكير واتساب"
                                onClick={() => {
                                  const message = encodeURIComponent(
                                    `عزيزي ${invoice.legalCase?.contact?.fullName}، نود تذكيركم بالفاتورة رقم ${invoice.invoiceNumber} بمبلغ ${invoice.totalAmount.toLocaleString()} ${sym}. يرجى التفضل بالسداد في أقرب وقت. شكراً لكم.`,
                                  );
                                  window.open(
                                    `https://wa.me/${invoice.legalCase?.contact?.phoneNumber}?text=${message}`,
                                    "_blank",
                                  );
                                }}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                          <Link href={`/billing/invoices/${invoice.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!invoices?.length && !invoicesLoading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      لا توجد فواتير حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Recent Payments */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-foreground font-heading mb-4 border-b border-border pb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-legal-gold" />
              سجل الدفعات الأخيرة
            </h2>
            <div className="space-y-4">
              {paymentsLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  جاري التحميل...
                </div>
              ) : (
                payments?.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center text-sm p-2 rounded hover:bg-secondary/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground truncate max-w-[120px]">
                        {payment.invoice?.legalCase?.title || "دفعة فاتورة"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "ar-SA",
                        )}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-400">
                          +{fmt(payment.amount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {payment.method}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {!payments?.length && !paymentsLoading && (
                <p className="text-center text-muted-foreground py-4 text-xs">
                  لا توجد دفعات مسجلة.
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-xs text-muted-foreground hover:text-legal-gold"
            >
              عرض كافة المعاملات
            </Button>
          </GlassCard>

          <GlassCard className="p-6 bg-legal-gold/5 border-legal-gold/20">
            <h2 className="text-lg font-semibold text-legal-gold font-heading mb-2">
              رصيد الأمانة
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              إجمالي المبالغ المودعة من قبل الموكلين لتغطية المصاريف المستقبلية.
            </p>
            <div className="text-3xl font-bold text-foreground mb-4">
                        {fmt(stats?.trustBalance)}
            </div>
            <Button className="w-full bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">
              إيداع جديد
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
