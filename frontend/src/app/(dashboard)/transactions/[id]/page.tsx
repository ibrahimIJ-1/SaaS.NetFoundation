'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransaction } from '@/hooks/use-workflows';
import { TransactionStepper } from '@/components/transactions/transaction-stepper';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading, error } = useTransaction(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-legal-gold" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-red-500/10 text-red-400 p-6 rounded-xl border border-red-500/20 text-center">
        <p>تعذّر تحميل بيانات المعاملة.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          رجوع
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/transactions')}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">
            {transaction.transactionNumber}
          </h1>
          <p className="text-sm text-muted-foreground">{transaction.workflowName}</p>
        </div>
      </div>

      <TransactionStepper transaction={transaction} />
    </div>
  );
}
