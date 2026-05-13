'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateInvoice } from '@/hooks/use-billing';
import { useCases } from '@/hooks/use-cases';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  ArrowRight,
  Calculator,
  Save
} from 'lucide-react';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب'),
  legalCaseId: z.string().min(1, 'يجب اختيار قضية'),
  issueDate: z.string().min(1, 'تاريخ الإصدار مطلوب'),
  dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'الوصف مطلوب'),
    quantity: z.number().min(0.01, 'الكمية يجب أن تكون أكبر من 0'),
    unitPrice: z.number().min(0, 'السعر لا يمكن أن يكون سالباً'),
    taxRate: z.number().min(0, 'الضريبة لا يمكن أن تكون سالبة'),
  })).min(1, 'يجب إضافة بند واحد على الأقل'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const { data: cases } = useCases();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 15 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: InvoiceFormValues) => {
    createInvoice.mutate(data, {
      onSuccess: () => {
        toast.success('تم إنشاء الفاتورة بنجاح');
        router.push('/billing/invoices');
      },
      onError: () => toast.error('حدث خطأ أثناء إنشاء الفاتورة'),
    });
  };

  const watchItems = form.watch('items');
  const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const total = subtotal + taxTotal;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Receipt className="w-8 h-8 text-legal-gold" />
            إنشاء فاتورة جديدة
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <GlassCard className="lg:col-span-2 p-6 space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">معلومات الفاتورة</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الفاتورة</FormLabel>
                    <FormControl><Input {...field} className="bg-secondary/20" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="legalCaseId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>القضية المرتبطة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/20">
                          <SelectValue placeholder="اختر قضية..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cases?.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title} ({c.caseNumber})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="issueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الإصدار</FormLabel>
                    <FormControl><Input type="date" {...field} className="bg-secondary/20" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <FormControl><Input type="date" {...field} className="bg-secondary/20" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4 pt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">بنود الفاتورة</h2>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 15 })}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة بند
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-end bg-secondary/10 p-3 rounded-lg border border-border/50 group">
                      <div className="flex-1 space-y-2">
                        <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] text-muted-foreground">الوصف</FormLabel>
                            <FormControl><Input {...field} placeholder="وصف الخدمة..." className="bg-background h-8 text-xs" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <div className="w-20 space-y-2">
                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] text-muted-foreground">الكمية</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="bg-background h-8 text-xs" 
                              />
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <div className="w-24 space-y-2">
                        <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] text-muted-foreground">سعر الوحدة</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="bg-background h-8 text-xs font-mono" 
                              />
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <div className="w-20 space-y-2">
                        <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] text-muted-foreground">الضريبة %</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                className="bg-background h-8 text-xs" 
                              />
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <div className="w-24 pb-2 text-left font-mono text-sm text-foreground">
                        ${(watchItems[index]?.quantity * watchItems[index]?.unitPrice * (1 + watchItems[index]?.taxRate / 100)).toFixed(2)}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-legal-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Summary & Action */}
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
                  <Calculator className="w-5 h-5 text-legal-gold" />
                  ملخص الحساب
                </h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span className="font-mono">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>إجمالي الضريبة</span>
                    <span className="font-mono">${taxTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
                    <span>الإجمالي</span>
                    <span className="text-legal-gold font-mono">${total.toLocaleString()}</span>
                  </div>
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="pt-4">
                    <FormLabel>ملاحظات الفاتورة</FormLabel>
                    <FormControl><Textarea {...field} className="bg-secondary/20 min-h-[100px]" /></FormControl>
                  </FormItem>
                )} />

                <div className="pt-4 space-y-2">
                  <Button type="submit" className="w-full bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold h-12" disabled={createInvoice.isPending}>
                    {createInvoice.isPending ? 'جاري الحفظ...' : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ وإصدار الفاتورة
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => router.back()}>
                    إلغاء
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
