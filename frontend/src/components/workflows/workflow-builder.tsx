'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateWorkflowRequest, WorkflowDefinition } from '@/types/workflow';
import { cn } from '@/lib/utils';

const stepSchema = z.object({
  name: z.string().min(1, 'اسم الخطوة مطلوب'),
  description: z.string().optional(),
  estimatedPrice: z.coerce.number().min(0, 'يجب أن يكون صفراً أو أكثر'),
  estimatedExpense: z.coerce.number().min(0, 'يجب أن يكون صفراً أو أكثر'),
  requiredFileNames: z.array(z.string()),
  defaultAssigneeContactIds: z.array(z.string()),
});

const workflowSchema = z.object({
  name: z.string().min(1, 'اسم الإجراء مطلوب'),
  description: z.string().optional(),
  totalEstimatedPrice: z.coerce.number().min(0),
  totalEstimatedExpenses: z.coerce.number().min(0),
  steps: z.array(stepSchema).min(1, 'يجب إضافة خطوة واحدة على الأقل'),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowBuilderProps {
  defaultValues?: WorkflowDefinition;
  onSubmit: (data: CreateWorkflowRequest) => void;
  isSubmitting?: boolean;
}

export function WorkflowBuilder({ defaultValues, onSubmit, isSubmitting }: WorkflowBuilderProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [fileInput, setFileInput] = useState<Record<number, string>>({});

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description ?? '',
          totalEstimatedPrice: defaultValues.totalEstimatedPrice,
          totalEstimatedExpenses: defaultValues.totalEstimatedExpenses,
          steps: defaultValues.steps.map((s) => ({
            name: s.name,
            description: s.description ?? '',
            estimatedPrice: s.estimatedPrice,
            estimatedExpense: s.estimatedExpense,
            requiredFileNames: s.requiredFileNames,
            defaultAssigneeContactIds: s.defaultAssigneeContactIds,
          })),
        }
      : {
          name: '',
          description: '',
          totalEstimatedPrice: 0,
          totalEstimatedExpenses: 0,
          steps: [
            {
              name: '',
              description: '',
              estimatedPrice: 0,
              estimatedExpense: 0,
              requiredFileNames: [],
              defaultAssigneeContactIds: [],
            },
          ],
        },
  });

  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'steps' });

  const watchedSteps = form.watch('steps');
  const totalStepPrice = watchedSteps?.reduce((sum, s) => sum + (Number(s.estimatedPrice) || 0), 0) ?? 0;
  const totalStepExpense = watchedSteps?.reduce((sum, s) => sum + (Number(s.estimatedExpense) || 0), 0) ?? 0;

  const toggleStep = (i: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const addFileToStep = (stepIdx: number) => {
    const val = fileInput[stepIdx]?.trim();
    if (!val) return;
    const current = form.getValues(`steps.${stepIdx}.requiredFileNames`);
    form.setValue(`steps.${stepIdx}.requiredFileNames`, [...current, val]);
    setFileInput((prev) => ({ ...prev, [stepIdx]: '' }));
  };

  const removeFile = (stepIdx: number, fileIdx: number) => {
    const current = form.getValues(`steps.${stepIdx}.requiredFileNames`);
    form.setValue(
      `steps.${stepIdx}.requiredFileNames`,
      current.filter((_, i) => i !== fileIdx)
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">معلومات الإجراء</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="wf-name">اسم الإجراء *</Label>
            <Input
              id="wf-name"
              placeholder="مثال: تأسيس شركة ذات مسؤولية محدودة"
              {...form.register('name')}
              className={form.formState.errors.name ? 'border-red-500' : ''}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="wf-desc">الوصف</Label>
            <Textarea
              id="wf-desc"
              placeholder="وصف مختصر للإجراء..."
              rows={2}
              {...form.register('description')}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wf-price">السعر التقديري الإجمالي</Label>
            <Input
              id="wf-price"
              type="number"
              min="0"
              step="500"
              {...form.register('totalEstimatedPrice')}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wf-expense">المصاريف التقديرية الإجمالية</Label>
            <Input
              id="wf-expense"
              type="number"
              min="0"
              step="500"
              {...form.register('totalEstimatedExpenses')}
            />
          </div>
        </div>

        {/* Auto-totals */}
        <div className="flex gap-6 pt-2 border-t border-border text-sm text-muted-foreground">
          <span>
            مجموع أسعار الخطوات:{' '}
            <span className="font-semibold text-foreground">{totalStepPrice.toLocaleString('ar-IQ')}</span>
          </span>
          <span>
            مجموع مصاريف الخطوات:{' '}
            <span className="font-semibold text-foreground">{totalStepExpense.toLocaleString('ar-IQ')}</span>
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">خطوات الإجراء</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              append({
                name: '',
                description: '',
                estimatedPrice: 0,
                estimatedExpense: 0,
                requiredFileNames: [],
                defaultAssigneeContactIds: [],
              });
              setExpandedSteps((prev) => new Set([...prev, fields.length]));
            }}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة خطوة
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
            لا توجد خطوات. أضف خطوة أولى.
          </div>
        )}

        {fields.map((field, idx) => {
          const isExpanded = expandedSteps.has(idx);
          const stepErrors = form.formState.errors.steps?.[idx];
          const files = form.watch(`steps.${idx}.requiredFileNames`) ?? [];

          return (
            <div
              key={field.id}
              className={cn(
                'bg-card border rounded-xl overflow-hidden transition-all',
                stepErrors ? 'border-red-500/50' : 'border-border'
              )}
            >
              {/* Step Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30">
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                <span className="w-6 h-6 rounded-full bg-legal-gold text-legal-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm font-medium truncate">
                  {form.watch(`steps.${idx}.name`) || `خطوة ${idx + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  {idx > 0 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(idx, idx - 1)}>
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                  )}
                  {idx < fields.length - 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(idx, idx + 1)}>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-500"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStep(idx)}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Step Body */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <Label>اسم الخطوة *</Label>
                      <Input
                        placeholder="مثال: إعداد عقد التأسيس"
                        {...form.register(`steps.${idx}.name`)}
                        className={stepErrors?.name ? 'border-red-500' : ''}
                      />
                      {stepErrors?.name && <p className="text-xs text-red-500">{stepErrors.name.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label>الوصف</Label>
                      <Textarea
                        placeholder="وصف مختصر..."
                        rows={2}
                        {...form.register(`steps.${idx}.description`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>السعر التقديري</Label>
                      <Input type="number" min="0" step="500" {...form.register(`steps.${idx}.estimatedPrice`)} />
                    </div>
                    <div className="space-y-1">
                      <Label>المصاريف التقديرية</Label>
                      <Input type="number" min="0" step="500" {...form.register(`steps.${idx}.estimatedExpense`)} />
                    </div>
                  </div>

                  {/* Required Files */}
                  <div className="space-y-2">
                    <Label>المستندات المطلوبة</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="مثال: جواز السفر"
                        value={fileInput[idx] ?? ''}
                        onChange={(e) => setFileInput((prev) => ({ ...prev, [idx]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFileToStep(idx))}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => addFileToStep(idx)}>
                        إضافة
                      </Button>
                    </div>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {files.map((file, fi) => (
                          <span
                            key={fi}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md"
                          >
                            {file}
                            <button type="button" onClick={() => removeFile(idx, fi)} className="text-muted-foreground hover:text-red-400">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
          {defaultValues ? 'حفظ التعديلات' : 'إنشاء الإجراء'}
        </Button>
      </div>
    </form>
  );
}
