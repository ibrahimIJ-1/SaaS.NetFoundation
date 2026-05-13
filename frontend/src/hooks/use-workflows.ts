import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowService } from '@/services/workflow.service';
import { CreateWorkflowRequest, CreateTransactionRequest, UpdateStepRequest } from '@/types/workflow';
import { toast } from 'sonner';

// ── Workflow Template Hooks ──────────────────────────────────────────────────

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: workflowService.getAll,
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflows', id],
    queryFn: () => workflowService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkflowRequest) => workflowService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('تم إنشاء قالب الإجراء بنجاح');
    },
    onError: () => toast.error('فشل إنشاء قالب الإجراء'),
  });
}

export function useUpdateWorkflow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkflowRequest) => workflowService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('تم تحديث قالب الإجراء');
    },
    onError: () => toast.error('فشل تحديث قالب الإجراء'),
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('تم حذف قالب الإجراء');
    },
    onError: () => toast.error('فشل حذف قالب الإجراء'),
  });
}

// ── Transaction Hooks ────────────────────────────────────────────────────────

export function useTransactions(params?: { status?: string; contactId?: string }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => workflowService.getAllTransactions(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => workflowService.getTransactionById(id),
    enabled: !!id,
  });
}

export function useTransactionStats() {
  return useQuery({
    queryKey: ['transactions', 'stats'],
    queryFn: workflowService.getStats,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => workflowService.createTransaction(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(`تم فتح المعاملة ${data.transactionNumber} بنجاح`);
    },
    onError: () => toast.error('فشل فتح المعاملة'),
  });
}

export function useUpdateStep(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, data }: { stepId: string; data: UpdateStepRequest }) =>
      workflowService.updateStep(transactionId, stepId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', transactionId] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('تم تحديث الخطوة بنجاح');
    },
    onError: () => toast.error('فشل تحديث الخطوة'),
  });
}

export function useUploadTransactionFile(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, file }: { stepId: string; file: File }) =>
      workflowService.uploadFile(transactionId, stepId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', transactionId] });
      toast.success('تم رفع الملف بنجاح');
    },
    onError: () => toast.error('فشل رفع الملف'),
  });
}

export function useDeleteTransactionFile(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, fileName }: { stepId: string; fileName: string }) =>
      workflowService.deleteFile(transactionId, stepId, fileName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', transactionId] });
      toast.success('تم حذف الملف');
    },
    onError: () => toast.error('فشل حذف الملف'),
  });
}

export function useCancelTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowService.cancelTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('تم إلغاء المعاملة');
    },
    onError: () => toast.error('فشل إلغاء المعاملة'),
  });
}
