import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '@/services/billing.service';
import { toast } from 'sonner';

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: billingService.getInvoices,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => billingService.getInvoiceById(id),
    enabled: !!id,
  });
}

export function useCaseInvoices(caseId: string) {
  return useQuery({
    queryKey: ['invoices', 'case', caseId],
    queryFn: () => billingService.getInvoicesByCase(caseId),
    enabled: !!caseId,
  });
}

export function useFinancialStats() {
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: billingService.getFinancialStats,
  });
}

export function useRecentPayments() {
  return useQuery({
    queryKey: ['recent-payments'],
    queryFn: billingService.getRecentPayments,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => billingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('تم إنشاء الفاتورة بنجاح');
    }
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      billingService.updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('تم تحديث حالة الفاتورة');
    }
  });
}

export function useExpenses(caseId?: string) {
  return useQuery({
    queryKey: ['expenses', caseId],
    queryFn: () => billingService.getExpenses(caseId),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => billingService.createExpense(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      if (variables.legalCaseId) {
        queryClient.invalidateQueries({ queryKey: ['expenses', variables.legalCaseId] });
      }
      toast.success('تم تسجيل المصروف بنجاح');
    }
  });
}

// Bulk Billing Hooks
export function useUnbilledSummary() {
  return useQuery({
    queryKey: ['billing', 'unbilled-summary'],
    queryFn: () => billingService.getUnbilledSummary(),
  });
}

export function useBulkGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseIds: string[]) => billingService.bulkGenerateInvoices(caseIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'unbilled-summary'] });
      toast.success(`تم إنشاء ${data.count} فواتير بنجاح`);
    }
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      billingService.recordPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      toast.success('تم تسجيل الدفعة بنجاح');
    }
  });
}

export function useTrustTransactions(caseId: string) {
  return useQuery({
    queryKey: ['trust', caseId],
    queryFn: () => billingService.getTrustTransactions(caseId),
    enabled: !!caseId,
  });
}

export function useRecordTrust() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: any }) => 
      billingService.recordTrust(caseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trust', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      toast.success('تم تحديث رصيد الأمانة');
    }
  });
}
