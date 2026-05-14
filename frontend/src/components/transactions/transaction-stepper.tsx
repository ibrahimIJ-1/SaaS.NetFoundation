"use client";

import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Loader2,
  AlertCircle,
  Upload,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LegalTransaction,
  TransactionStep,
  StepStatus,
} from "@/types/workflow";
import {
  useUpdateStep,
  useCancelTransaction,
  useUploadTransactionFile,
  useDeleteTransactionFile,
} from "@/hooks/use-workflows";
import { useCurrencies } from "@/hooks/use-currencies";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const stepUpdateSchema = z.object({
  actualPrice: z.coerce.number(),
  actualExpense: z.coerce.number(),
  expenseDescription: z.string().optional(),
  notes: z.string().optional(),
  currencyId: z.string().optional(),
});
type StepUpdateForm = z.infer<typeof stepUpdateSchema>;

const statusConfig: Record<
  StepStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  Pending: {
    label: "في الانتظار",
    color: "text-muted-foreground",
    icon: Circle,
  },
  InProgress: { label: "جارٍ التنفيذ", color: "text-blue-400", icon: Clock },
  Completed: { label: "مكتملة", color: "text-emerald-400", icon: CheckCircle2 },
};

const txStatusColors: Record<string, string> = {
  Active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface StepPanelProps {
  step: TransactionStep;
  transactionId: string;
  isActive: boolean;
  currencySymbol: string;
  currencies?: any[];
}

function StepPanel({
  step,
  transactionId,
  isActive,
  currencySymbol,
  currencies,
}: StepPanelProps) {
  const [expanded, setExpanded] = useState(isActive);
  const [isEditing, setIsEditing] = useState(step.status !== "Completed");
  const { mutate: updateStep, isPending } = useUpdateStep(transactionId);
  const { mutate: uploadFile, isPending: uploading } =
    useUploadTransactionFile(transactionId);
  const { mutate: deleteFile } = useDeleteTransactionFile(transactionId);

  const form = useForm<StepUpdateForm>({
    resolver: zodResolver(stepUpdateSchema) as Resolver<StepUpdateForm>,
    defaultValues: {
      actualPrice: step.actualPrice,
      actualExpense: step.actualExpense,
      expenseDescription: step.expenseDescription ?? "",
      notes: step.notes ?? "",
      currencyId: step.currencyId ?? "none",
    },
  });

  const stepCurrencyId = form.watch("currencyId");
  const stepCurrency = currencies?.find((c) => c.id === stepCurrencyId);
  const displaySymbol =
    stepCurrencyId === "none" || !stepCurrency
      ? currencySymbol
      : stepCurrency.symbol;

  const handleComplete = (data: StepUpdateForm) => {
    const payload = {
      ...data,
      currencyId: data.currencyId === "none" ? null : data.currencyId,
    };
    updateStep(
      { stepId: step.id, data: { ...payload, status: "Completed" } as any },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const handleSaveOnly = (data: StepUpdateForm) => {
    const payload = {
      ...data,
      currencyId: data.currencyId === "none" ? null : data.currencyId,
    };
    updateStep(
      { stepId: step.id, data: payload as any },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const cfg = statusConfig[step.status];
  const Icon = cfg.icon;
  const profit = step.actualPrice - step.actualExpense;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        step.status === "Completed"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : step.status === "InProgress"
            ? "border-blue-500/30 bg-blue-500/5 ring-1 ring-blue-500/20"
            : "border-border bg-card/50 opacity-70",
      )}
    >
      {/* Step Header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-right"
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon className={cn("w-5 h-5 flex-shrink-0", cfg.color)} />
        <span className="w-6 h-6 rounded-full border border-border text-xs font-bold flex items-center justify-center flex-shrink-0 text-muted-foreground">
          {step.order}
        </span>
        <div className="flex-1 text-right">
          <p className="text-sm font-medium text-foreground">{step.stepName}</p>
          <p className="text-xs text-muted-foreground">{cfg.label}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="hidden sm:block">
            سعر:{" "}
            <span className="font-medium text-foreground">
              {step.actualPrice.toLocaleString("ar-IQ")} {displaySymbol}
            </span>
          </span>
          <span className="hidden sm:block">
            مصاريف:{" "}
            <span className="font-medium text-amber-400">
              {step.actualExpense.toLocaleString("ar-IQ")} {displaySymbol}
            </span>
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Step Body */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4"
          dir="rtl"
        >
          {/* Status Header for Completed */}
          {!isEditing && step.status === "Completed" && (
            <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded-lg">
              <span className="text-xs text-emerald-400 font-medium">
                تم إكمال هذه الخطوة
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                <RotateCcw className="w-3 h-3 ml-1" />
                تعديل البيانات
              </Button>
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(handleComplete)}
            className="space-y-4"
          >
            {/* Required Files */}
            {step.requiredFileNames?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  المستندات المطلوبة:
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.requiredFileNames.map((f, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md"
                    >
                      <FileText className="w-3 h-3" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Files Section */}
            <div className="space-y-2">
              <Label className="text-xs">الملفات المرفوعة</Label>
              <div className="flex flex-wrap gap-2">
                {step.uploadedFilesJson ? (
                  JSON.parse(step.uploadedFilesJson).map(
                    (file: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border group relative"
                      >
                        <FileText className="w-4 h-4 text-legal-gold" />
                        <span className="text-xs truncate max-w-[150px]">
                          {file}
                        </span>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              deleteFile({ stepId: step.id, fileName: file })
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    لا توجد ملفات مرفوعة.
                  </p>
                )}

                {isEditing && (
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${step.id}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile({ stepId: step.id, file });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-dashed"
                      disabled={uploading}
                      onClick={() =>
                        document.getElementById(`file-${step.id}`)?.click()
                      }
                    >
                      {uploading ? (
                        <Loader2 className="w-3 h-3 animate-spin ml-1" />
                      ) : (
                        <Upload className="w-3 h-3 ml-1" />
                      )}
                      رفع ملف
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">السعر الفعلي</Label>
                <Input
                  type="number"
                  {...form.register("actualPrice")}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">المصاريف الفعلية</Label>
                <Input
                  type="number"
                  {...form.register("actualExpense")}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">العملة</Label>
                <Select
                  value={form.watch("currencyId")}
                  onValueChange={(v: string | null) => form.setValue("currencyId", v ?? undefined)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="عملة الخطوة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">نفس عملة المعاملة</SelectItem>
                    {currencies?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">تفاصيل المصاريف</Label>
                <Input
                  placeholder="مثال: رسوم تسجيل وزارة التجارة"
                  {...form.register("expenseDescription")}
                  disabled={!isEditing}
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">ملاحظات</Label>
                <Textarea
                  placeholder="ملاحظات حول هذه الخطوة..."
                  rows={2}
                  {...form.register("notes")}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Financial summary */}
            <div className="flex gap-4 p-3 bg-secondary/30 rounded-lg text-xs">
              <div>
                <span className="text-muted-foreground">السعر التقديري: </span>
                <span className="font-medium">
                  {step.estimatedPrice.toLocaleString("ar-IQ")} {displaySymbol}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  المصاريف التقديرية:{" "}
                </span>
                <span className="font-medium">
                  {step.estimatedExpense.toLocaleString("ar-IQ")}{" "}
                  {displaySymbol}
                </span>
              </div>
              <div className="mr-auto">
                <span className="text-muted-foreground">
                  صافي الربح الفعلي:{" "}
                </span>
                <span
                  className={cn(
                    "font-bold",
                    profit >= 0 ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {profit.toLocaleString("ar-IQ")} {displaySymbol}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex gap-2 justify-end">
                {step.status === "Completed" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    إلغاء التعديل
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={form.handleSubmit(handleSaveOnly)}
                >
                  حفظ
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin ml-1" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 ml-1" />
                  )}
                  {step.status === "Completed"
                    ? "تحديث وإنهاء"
                    : "إنهاء الخطوة"}
                </Button>
              </div>
            )}

            {!isEditing &&
              step.status === "Completed" &&
              step.completionDate && (
                <p className="text-xs text-emerald-400 text-left">
                  ✓ اكتملت في{" "}
                  {new Date(step.completionDate).toLocaleDateString("ar-IQ")}
                </p>
              )}
          </form>
        </div>
      )}
    </div>
  );
}

// ── Main Stepper ─────────────────────────────────────────────────────────────

interface TransactionStepperProps {
  transaction: LegalTransaction;
}

export function TransactionStepper({ transaction }: TransactionStepperProps) {
  const { data: currencies } = useCurrencies();
  const { mutate: cancel, isPending: cancelling } = useCancelTransaction();

  const currency = currencies?.find((c) => c.id === transaction.currencyId);
  const symbol = currency?.symbol || "";
  const isBase = currency?.isBase;
  const baseSymbol = currencies?.find((c) => c.isBase)?.symbol || "";
  const totalActualPrice = transaction.steps.reduce(
    (s, step) => s + step.actualPrice,
    0,
  );
  const totalExpenses = transaction.steps.reduce(
    (s, step) => s + step.actualExpense,
    0,
  );
  const netProfit = totalActualPrice - totalExpenses;
  const progress =
    transaction.steps.length > 0
      ? Math.round(
          (transaction.steps.filter((s) => s.status === "Completed").length /
            transaction.steps.length) *
            100,
        )
      : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Transaction Header */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {transaction.transactionNumber}
              </h2>
              <Badge
                className={cn(
                  "border text-xs",
                  txStatusColors[transaction.status],
                )}
              >
                {transaction.status === "Active"
                  ? "نشطة"
                  : transaction.status === "Completed"
                    ? "مكتملة"
                    : "ملغاة"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {transaction.workflowName} — {transaction.contactName}
            </p>
          </div>
          {transaction.status === "Active" && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              disabled={cancelling}
              onClick={() => cancel(transaction.id)}
            >
              إلغاء المعاملة
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>التقدم الإجمالي</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-legal-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "السعر المتفق",
              value: transaction.actualPrice,
              color: "text-foreground",
            },
            {
              label: "مجموع المصاريف",
              value: totalExpenses,
              color: "text-amber-400",
            },
            {
              label: "السعر التقديري",
              value: transaction.estimatedPrice,
              color: "text-muted-foreground",
            },
            {
              label: "صافي الربح",
              value: netProfit,
              color: netProfit >= 0 ? "text-emerald-400" : "text-red-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <div className="flex flex-col">
                <p className={cn("text-sm font-bold", stat.color)}>
                  {stat.value.toLocaleString("ar-IQ")} {symbol}
                </p>
                {!isBase && transaction.exchangeRate > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    ≈{" "}
                    {(stat.value * transaction.exchangeRate).toLocaleString(
                      "ar-IQ",
                    )}{" "}
                    {baseSymbol}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {transaction.steps.map((step) => (
          <StepPanel
            key={step.id}
            step={step}
            transactionId={transaction.id}
            isActive={step.status === "InProgress"}
            currencySymbol={symbol}
            currencies={currencies}
          />
        ))}
      </div>

      {transaction.status === "Completed" && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>تم إنجاز هذه المعاملة بنجاح. جميع الخطوات مكتملة.</span>
        </div>
      )}

      {transaction.status === "Cancelled" && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>تم إلغاء هذه المعاملة.</span>
        </div>
      )}
    </div>
  );
}
