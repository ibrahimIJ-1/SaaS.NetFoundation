import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currencyService } from '@/services/currency.service';
import { Currency } from '@/types/currency';
import { toast } from 'sonner';

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: currencyService.getAll,
  });
}

export function useCreateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Currency>) => currencyService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('تمت إضافة العملة بنجاح');
    },
    onError: () => toast.error('فشل إضافة العملة'),
  });
}

export function useUpdateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Currency> }) =>
      currencyService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('تم تحديث العملة بنجاح');
    },
    onError: () => toast.error('فشل تحديث العملة'),
  });
}
