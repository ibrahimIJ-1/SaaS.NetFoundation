'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflows, useCreateTransaction } from '@/hooks/use-workflows';
import { useContacts } from '@/hooks/use-contacts';
import { useCurrencies } from '@/hooks/use-currencies';
import { WorkflowDefinition } from '@/types/workflow';

const schema = z.object({
  workflowDefinitionId: z.string().min(1, 'اختر نوع الإجراء'),
  contactId: z.string().optional(),
  clientName: z.string().optional(),
  actualPrice: z.coerce.number(),
  currencyId: z.string().min(1, 'العملة مطلوبة'),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface StartTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function StartTransactionModal({ open, onClose, onSuccess }: StartTransactionModalProps) {
  const { data: workflows, isLoading: loadingWorkflows } = useWorkflows();
  const { data: contacts } = useContacts();
  const { data: currencies } = useCurrencies();
  const { mutate: create, isPending } = useCreateTransaction();
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { workflowDefinitionId: '', contactId: '', clientName: '', actualPrice: 0, currencyId: '', notes: '' },
  });

  const selectedWorkflowId = form.watch('workflowDefinitionId');
  const selectedWorkflow = workflows?.find((w) => w.id === selectedWorkflowId);

  const handleWorkflowChange = (id: string) => {
    form.setValue('workflowDefinitionId', id);
    const wf = workflows?.find(w => w.id === id);
    if (wf) {
      form.setValue('actualPrice', wf.totalEstimatedPrice);
      if (wf.currencyId) form.setValue('currencyId', wf.currencyId);
    }
  };

  const handleContactChange = (id: string) => {
    form.setValue('contactId', id);
    const contact = contacts?.find((c) => c.id === id);
    if (contact) form.setValue('clientName', contact.fullName);
  };

  const handleSubmit = (data: FormData) => {
    create(
      { ...data, contactId: data.contactId || undefined },
      {
        onSuccess: (result) => {
          form.reset();
          setSelectedWorkflow(null);
          onClose();
          onSuccess?.(result.id);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>فتح معاملة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Workflow */}
          <div className="space-y-1">
            <Label>نوع الإجراء *</Label>
            <Select onValueChange={handleWorkflowChange} disabled={loadingWorkflows}>
              <SelectTrigger>
                <SelectValue placeholder={loadingWorkflows ? 'جاري التحميل...' : 'اختر الإجراء'} />
              </SelectTrigger>
              <SelectContent>
                {workflows?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.workflowDefinitionId && (
              <p className="text-xs text-red-500">{form.formState.errors.workflowDefinitionId.message}</p>
            )}
          </div>

          {selectedWorkflow && (
            <div className="p-3 bg-secondary/30 rounded-lg text-xs space-y-1">
              <p className="text-muted-foreground">
                السعر التقديري:{' '}
                <span className="font-semibold text-foreground">
                  {selectedWorkflow.totalEstimatedPrice.toLocaleString('ar-IQ')}
                </span>
              </p>
              <p className="text-muted-foreground">
                المصاريف التقديرية:{' '}
                <span className="font-semibold text-amber-400">
                  {selectedWorkflow.totalEstimatedExpenses.toLocaleString('ar-IQ')}
                </span>
              </p>
              <p className="text-muted-foreground">عدد الخطوات: {selectedWorkflow.steps.length}</p>
            </div>
          )}

          {/* Client */}
          <div className="space-y-1">
            <Label>الموكل</Label>
            <Select onValueChange={handleContactChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الموكل (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                {contacts?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>اسم الموكل (إن لم يكن في القائمة)</Label>
            <Input placeholder="الاسم الكامل..." {...form.register('clientName')} />
          </div>

          <div className="space-y-1">
            <Label>السعر المتفق عليه *</Label>
            <Input type="number" {...form.register('actualPrice')} />
            {form.formState.errors.actualPrice && (
              <p className="text-xs text-red-500">{form.formState.errors.actualPrice.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>العملة *</Label>
            <Select 
              value={form.watch('currencyId')} 
              onValueChange={(v) => form.setValue('currencyId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر العملة" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.symbol})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.currencyId && (
              <p className="text-xs text-red-500">{form.formState.errors.currencyId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Textarea rows={2} placeholder="ملاحظات إضافية..." {...form.register('notes')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button
              type="submit"
              className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              فتح المعاملة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
