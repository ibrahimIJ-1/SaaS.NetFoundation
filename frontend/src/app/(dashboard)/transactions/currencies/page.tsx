'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCurrencies, useCreateCurrency, useUpdateCurrency } from '@/hooks/use-currencies';
import { Currency } from '@/types/currency';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const currencySchema = z.object({
  code: z.string().min(2, 'الكود مطلوب (مثلاً USD)'),
  name: z.string().min(2, 'الاسم مطلوب'),
  symbol: z.string().min(1, 'الرمز مطلوب'),
  exchangeRate: z.coerce.number().min(0, 'يجب أن يكون أكبر من أو يساوي صفر'),
  isBase: z.boolean().default(false),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

export default function CurrenciesPage() {
  const { data: currencies, isLoading } = useCurrencies();
  const { mutate: create, isPending: creating } = useCreateCurrency();
  const { mutate: update, isPending: updating } = useUpdateCurrency();
  
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Currency | null>(null);

  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
      exchangeRate: 1,
      isBase: false,
    }
  });

  const handleOpen = (c?: Currency) => {
    if (c) {
      setEditTarget(c);
      form.reset({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        exchangeRate: c.exchangeRate,
        isBase: c.isBase,
      });
    } else {
      setEditTarget(null);
      form.reset({ code: '', name: '', symbol: '', exchangeRate: 1, isBase: false });
    }
    setOpen(true);
  };

  const onSubmit = (data: CurrencyFormData) => {
    if (editTarget) {
      update({ id: editTarget.id, data }, { onSuccess: () => setOpen(false) });
    } else {
      create(data, { onSuccess: () => setOpen(false) });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">إدارة العملات</h1>
            <p className="text-muted-foreground mt-1">أضف العملات المتاحة وحدد أسعار الصرف مقابل العملة الأساسية.</p>
          </div>
        </div>
        <Button
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
          onClick={() => handleOpen()}
        >
          <Plus className="w-4 h-4 ml-2" />
          عملة جديدة
        </Button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-legal-gold" />
          </div>
        ) : (
          currencies?.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-legal-gold/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-legal-gold/10 flex items-center justify-center text-legal-gold font-bold text-lg">
                  {c.symbol}
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    {c.name}
                    {c.isBase && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        الأساسية
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">{c.code} — سعر الصرف: {c.exchangeRate.toLocaleString('ar-IQ', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleOpen(c)}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'تعديل عملة' : 'إضافة عملة جديدة'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>كود العملة (مثال: USD)</Label>
                <Input {...form.register('code')} placeholder="USD" />
              </div>
              <div className="space-y-1">
                <Label>الرمز (مثال: $)</Label>
                <Input {...form.register('symbol')} placeholder="$" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>الاسم (مثال: دولار أمريكي)</Label>
              <Input {...form.register('name')} placeholder="دولار أمريكي" />
            </div>
            <div className="space-y-1">
              <Label>سعر الصرف مقابل العملة الأساسية</Label>
              <Input type="number" step="0.000001" {...form.register('exchangeRate')} />
              <p className="text-[10px] text-muted-foreground">كم يساوي من العملة الأساسية؟ (مثلاً إذا كان الدولار يساوي 0.89 من العملة الأساسية، ضع 0.89).</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...form.register('isBase')} id="isBase" />
              <Label htmlFor="isBase" className="cursor-pointer">هذه هي العملة الأساسية للنظام</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-legal-gold text-legal-primary font-bold w-full" disabled={creating || updating}>
                {(creating || updating) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                {editTarget ? 'تحديث العملة' : 'إضافة العملة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
