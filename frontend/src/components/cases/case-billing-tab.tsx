'use client';

import { useInvoices, useTrustTransactions, useRecordTrust } from '@/hooks/use-billing';
import { useBaseCurrency } from '@/hooks/use-base-currency';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { 
  Receipt, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { RecordPaymentModal } from '@/components/billing/payment-modal';
import { RecordTrustModal } from '@/components/billing/record-trust-modal';
import Link from 'next/link';


interface CaseBillingTabProps {
  caseId: string;
}

export function CaseBillingTab({ caseId }: CaseBillingTabProps) {
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: trustData, isLoading: trustLoading } = useTrustTransactions(caseId);
  const baseCurrency = useBaseCurrency();
  const sym = baseCurrency?.symbol || '';
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showTrustModal, setShowTrustModal] = useState(false);


  const caseInvoices = invoices?.filter(i => i.legalCaseId === caseId) ?? [];
  const totalInvoiced = caseInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = caseInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const balance = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-legal-gold">
          <p className="text-xs text-muted-foreground mb-1">إجمالي المبالغ المفوترة</p>
          <div className="text-2xl font-bold text-foreground font-mono">{totalInvoiced.toLocaleString()} {sym}</div>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-muted-foreground mb-1">المبالغ المدفوعة</p>
          <div className="text-2xl font-bold text-foreground font-mono">{totalPaid.toLocaleString()} {sym}</div>
        </GlassCard>
        <GlassCard className={cn("p-4 border-l-4", balance > 0 ? "border-l-red-500" : "border-l-slate-500")}>
          <p className="text-xs text-muted-foreground mb-1">المستحق المتبقي</p>
          <div className="text-2xl font-bold text-foreground font-mono">{balance.toLocaleString()} {sym}</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices List */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
              <Receipt className="w-5 h-5 text-legal-gold" />
              الفواتير الصادرة
            </h3>
            <Link href={`/billing/invoices/new?caseId=${caseId}`}>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="w-3 h-3 ml-1" />
                فاتورة
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {invoicesLoading ? (
              <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
            ) : caseInvoices.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground italic text-sm">لا توجد فواتير لهذه القضية</p>
            ) : (
              caseInvoices.map(invoice => (
                <div key={invoice.id} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg border border-border group">
                  <div>
                    <p className="font-semibold text-sm text-foreground">#{invoice.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="text-left flex items-center gap-4">
                    <div>
                      <p className="font-bold text-sm text-foreground">{invoice.totalAmount.toLocaleString()} {sym}</p>
                      <p className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border w-fit mr-auto mt-1",
                        invoice.status === 'Paid' ? "text-green-400 border-green-500/30" : "text-orange-400 border-orange-500/30"
                      )}>
                        {invoice.status === 'Paid' ? 'مدفوعة' : 'غير مكتملة'}
                      </p>
                    </div>
                    {invoice.status !== 'Paid' && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedInvoice(invoice)}>
                        <CreditCard className="w-4 h-4 text-legal-gold" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Trust Account Ledger */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
              <Wallet className="w-5 h-5 text-legal-gold" />
              حساب الأمانة
            </h3>
            <div className="text-sm font-bold text-legal-gold font-mono">
              رصيد: {trustData?.balance.toLocaleString() ?? '0'} {sym}
            </div>
          </div>

          <div className="space-y-3">
            {trustLoading ? (
              <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
            ) : trustData?.transactions.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground italic text-sm">لا توجد عمليات في حساب الأمانة</p>
            ) : (
              trustData?.transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      t.type === 'Deposit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {t.type === 'Deposit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.description}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(t.transactionDate).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold font-mono",
                    t.type === 'Deposit' ? "text-green-500" : "text-red-500"
                  )}>
                    {t.type === 'Deposit' ? '+' : '-'}{t.amount.toLocaleString()} {sym}
                  </div>
                </div>
              ))
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-xs text-muted-foreground hover:text-legal-gold"
            onClick={() => setShowTrustModal(true)}
          >
            <Plus className="w-3 h-3 ml-1" />
            إجراء معاملة أمانة
          </Button>
        </GlassCard>
      </div>

      <RecordTrustModal 
        caseId={caseId} 
        open={showTrustModal} 
        onOpenChange={setShowTrustModal} 
      />


      {selectedInvoice && (
        <RecordPaymentModal 
          invoice={selectedInvoice} 
          open={!!selectedInvoice} 
          onOpenChange={(open) => !open && setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}
