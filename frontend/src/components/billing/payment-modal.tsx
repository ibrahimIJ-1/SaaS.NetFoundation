'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRecordPayment } from '@/hooks/use-billing';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CreditCard, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Invoice, PaymentMethod } from '@/types/billing';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من 0'),
  paymentDate: z.string().min(1, 'التاريخ مطلوب'),
  method: z.enum(['Cash', 'BankTransfer', 'Check', 'CreditCard', 'Online', 'Other'] as const),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

interface RecordPaymentModalProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentModal({ invoice, open, onOpenChange }: RecordPaymentModalProps) {
  const recordPayment = useRecordPayment();
  const remaining = invoice.totalAmount - invoice.paidAmount;

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remaining,
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'Cash',
      referenceNumber: '',
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof paymentSchema>) => {
    recordPayment.mutate({
      id: invoice.id,
      data: values
    }, {
      onSuccess: () => {
        toast.success('تم تسجيل الدفعة بنجاح');
        form.reset();
        onOpenChange(false);
      },
      onError: () => toast.error('حدث خطأ أثناء تسجيل الدفعة'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-legal-gold" />
            تسجيل دفعة جديدة
          </DialogTitle>
          <DialogDescription>
            تسجيل مبلغ مستلم للفاتورة #{invoice.invoiceNumber}. المبلغ المتبقي: ${remaining.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>المبلغ المستلم</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      className="pr-10 bg-secondary/20 font-mono" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="paymentDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الدفع</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="date" {...field} className="pr-10 bg-secondary/20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>وسيلة الدفع</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/20">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">كاش / نقدي</SelectItem>
                      <SelectItem value="BankTransfer">تحويل بنكي</SelectItem>
                      <SelectItem value="Check">شيك</SelectItem>
                      <SelectItem value="CreditCard">بطاقة ائتمان</SelectItem>
                      <SelectItem value="Online">دفع إلكتروني</SelectItem>
                      <SelectItem value="Other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="referenceNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>رقم المرجع (اختياري)</FormLabel>
                <FormControl><Input {...field} placeholder="رقم الشيك أو رقم التحويل..." className="bg-secondary/20" /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات</FormLabel>
                <FormControl><Textarea {...field} className="bg-secondary/20 min-h-[80px]" /></FormControl>
              </FormItem>
            )} />

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
              <Button type="submit" className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? 'جاري الحفظ...' : 'تسجيل الدفعة'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
