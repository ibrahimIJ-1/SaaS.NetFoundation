'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, ArrowRight, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWorkflows, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow } from '@/hooks/use-workflows';
import { useCurrencies } from '@/hooks/use-currencies';
import { WorkflowBuilder } from '@/components/workflows/workflow-builder';
import { WorkflowDefinition, CreateWorkflowRequest } from '@/types/workflow';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function WorkflowCard({ workflow, onEdit, onDelete, currencies }: {
  workflow: WorkflowDefinition;
  onEdit: (w: WorkflowDefinition) => void;
  onDelete: (id: string) => void;
  currencies?: any[];
}) {
  const [expanded, setExpanded] = useState(false);
  const currency = currencies?.find(c => c.id === workflow.currencyId);
  const symbol = currency?.symbol || '';

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-legal-gold/30 transition-all">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-lg bg-legal-gold/10 flex items-center justify-center flex-shrink-0">
          <Layers className="w-5 h-5 text-legal-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{workflow.name}</h3>
          {workflow.description && (
            <p className="text-xs text-muted-foreground truncate">{workflow.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
          <span className="hidden sm:block">
            <span className="font-medium text-foreground">{workflow.steps.length}</span> خطوة
          </span>
          <span className="hidden md:block">
            السعر:{' '}
            <span className="font-medium text-foreground">
              {workflow.totalEstimatedPrice.toLocaleString('ar-IQ')} {symbol}
            </span>
          </span>
          <span className="hidden md:block">
            مصاريف:{' '}
            <span className="font-medium text-amber-400">
              {workflow.totalEstimatedExpenses.toLocaleString('ar-IQ')} {symbol}
            </span>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(workflow)}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
              onClick={() => onDelete(workflow.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 pb-4" dir="rtl">
          <div className="mt-3 space-y-2">
            {workflow.steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg text-sm"
              >
                <span className="w-6 h-6 rounded-full bg-legal-gold/20 text-legal-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-foreground">{step.name}</span>
                <span className="text-muted-foreground text-xs">
                  {step.estimatedPrice.toLocaleString('ar-IQ')} {symbol} + مصاريف {step.estimatedExpense.toLocaleString('ar-IQ')} {symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditWorkflowDialog({ workflow, open, onClose }: {
  workflow: WorkflowDefinition;
  open: boolean;
  onClose: () => void;
}) {
  const { mutate: update, isPending } = useUpdateWorkflow(workflow.id);

  const handleSubmit = (data: CreateWorkflowRequest) => {
    update(data, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل إجراء: {workflow.name}</DialogTitle>
        </DialogHeader>
        <WorkflowBuilder defaultValues={workflow} onSubmit={handleSubmit} isSubmitting={isPending} />
      </DialogContent>
    </Dialog>
  );
}

export default function WorkflowsPage() {
  const { data: workflows, isLoading, error } = useWorkflows();
  const { data: currencies } = useCurrencies();
  const { mutate: create, isPending: creating } = useCreateWorkflow();
  const { mutate: deleteWorkflow } = useDeleteWorkflow();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkflowDefinition | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = (data: CreateWorkflowRequest) => {
    create(data, { onSuccess: () => setShowCreate(false) });
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">قوالب الإجراءات</h1>
            <p className="text-muted-foreground mt-1">أنشئ وعدّل قوالب إجراءاتك القانونية والإدارية.</p>
          </div>
        </div>
        <Button
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          إجراء جديد
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-legal-gold" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          حدث خطأ أثناء تحميل قوالب الإجراءات.
        </div>
      ) : workflows?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed border-border">
          <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">لا توجد قوالب إجراءات بعد.</p>
          <Button
            className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 ml-2" />
            أنشئ أول إجراء
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows?.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onEdit={setEditTarget}
              onDelete={setDeleteId}
              currencies={currencies}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء إجراء جديد</DialogTitle>
          </DialogHeader>
          <WorkflowBuilder onSubmit={handleCreate} isSubmitting={creating} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editTarget && (
        <EditWorkflowDialog
          workflow={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف قالب الإجراء؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا القالب نهائياً. لن تتأثر المعاملات المفتوحة سابقاً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={() => {
                if (deleteId) deleteWorkflow(deleteId);
                setDeleteId(null);
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
