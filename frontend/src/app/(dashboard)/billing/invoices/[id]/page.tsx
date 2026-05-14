'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInvoice, useUpdateInvoiceStatus } from '@/hooks/use-billing';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Receipt,
  ArrowRight,
  CreditCard,
  Send,
  FileText,
  Printer,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { InvoiceStatus } from '@/types/billing';
import { useState } from 'react';
import { RecordPaymentModal } from '@/components/billing/payment-modal';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string }> = {
  Draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  Sent: { label: 'مرسلة', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Partial: { label: 'جزئية', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  Paid: { label: 'مدفوعة', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Overdue: { label: 'متأخرة', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  Cancelled: { label: 'ملغاة', color: 'bg-secondary text-muted-foreground border-border' },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: invoice, isLoading } = useInvoice(id);
  const updateStatus = useUpdateInvoiceStatus();
  const [showPayment, setShowPayment] = useState(false);

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">جاري التحميل...</div>;
  }

  if (!invoice) {
    return <div className="py-20 text-center text-muted-foreground">الفاتورة غير موجودة</div>;
  }

  const remaining = invoice.totalAmount - invoice.paidAmount;
  const statusInfo = STATUS_CONFIG[invoice.status];

  const handleSend = () => updateStatus.mutate({ id, status: 'Sent' });
  const handleCancel = () => updateStatus.mutate({ id, status: 'Cancelled' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
              <Receipt className="w-8 h-8 text-legal-gold" />
              فاتورة #{invoice.invoiceNumber}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'Draft' && (
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Send className="w-4 h-4" />
              إرسال الفاتورة
            </Button>
          )}
          {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
            <Button onClick={() => setShowPayment(true)} className="bg-green-600 hover:bg-green-700 gap-2">
              <CreditCard className="w-4 h-4" />
              تسجيل دفعة
            </Button>
          )}
          {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && (
            <Button variant="outline" onClick={handleCancel} className="gap-2 text-red-400 border-red-500/30">
              <XCircle className="w-4 h-4" />
              إلغاء
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-4 border-r-4 border-r-legal-gold">
              <p className="text-xs text-muted-foreground mb-1">المبلغ الإجمالي</p>
              <p className="text-2xl font-bold text-foreground font-mono">${invoice.totalAmount.toLocaleString()}</p>
            </GlassCard>
            <GlassCard className="p-4 border-r-4 border-r-green-500">
              <p className="text-xs text-muted-foreground mb-1">المبلغ المدفوع</p>
              <p className="text-2xl font-bold text-foreground font-mono">${invoice.paidAmount.toLocaleString()}</p>
            </GlassCard>
            <GlassCard className={cn("p-4 border-r-4", remaining > 0 ? "border-r-red-500" : "border-r-slate-500")}>
              <p className="text-xs text-muted-foreground mb-1">المبلغ المتبقي</p>
              <p className="text-2xl font-bold text-foreground font-mono">${remaining.toLocaleString()}</p>
            </GlassCard>
          </div>

          {/* Invoice Details */}
          <GlassCard className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">حالة الفاتورة</p>
                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">تاريخ الإصدار</p>
                <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">تاريخ الاستحقاق</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">القضية</p>
                <Link href={`/cases/${invoice.legalCaseId}`} className="font-medium text-legal-gold hover:underline">
                  {invoice.legalCase?.title || 'غير محدد'}
                </Link>
              </div>
            </div>

            {/* Line Items */}
            <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">بنود الفاتورة</h3>
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">الوصف</th>
                  <th className="pb-3 font-medium text-center">الكمية</th>
                  <th className="pb-3 font-medium text-left">سعر الوحدة</th>
                  <th className="pb-3 font-medium text-left">الضريبة</th>
                  <th className="pb-3 font-medium text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/10">
                    <td className="py-3 font-medium">{item.description}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-left font-mono">${item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 text-left font-mono">{item.taxRate}%</td>
                    <td className="py-3 text-left font-mono font-bold">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={4} className="py-3 text-left font-medium">المجموع الفرعي</td>
                  <td className="py-3 text-left font-mono">${invoice.subTotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-3 text-left font-medium">الضريبة</td>
                  <td className="py-3 text-left font-mono">${invoice.taxTotal.toLocaleString()}</td>
                </tr>
                <tr className="text-lg font-bold">
                  <td colSpan={4} className="py-3 text-left">الإجمالي</td>
                  <td className="py-3 text-left font-mono text-legal-gold">${invoice.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            {invoice.notes && (
              <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-legal-gold" />
              سير العمل
            </h3>
            <div className="space-y-3">
              {(['Draft', 'Sent', 'Partial', 'Paid'] as InvoiceStatus[]).map((step) => {
                const stepInfo = STATUS_CONFIG[step];
                const isActive = invoice.status === step;
                const isCompleted = ['Draft', 'Sent', 'Partial', 'Paid'].indexOf(step) <=
                  ['Draft', 'Sent', 'Partial', 'Paid'].indexOf(invoice.status);
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      isCompleted ? "bg-green-500" : isActive ? "bg-legal-gold" : "bg-secondary"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isCompleted ? "text-green-500" : isActive ? "text-foreground font-bold" : "text-muted-foreground"
                    )}>
                      {stepInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {showPayment && (
        <RecordPaymentModal
          invoice={invoice}
          open={showPayment}
          onOpenChange={setShowPayment}
        />
      )}
    </div>
  );
}
