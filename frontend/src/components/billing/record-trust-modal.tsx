"use client";

import * as React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRecordTrust } from "@/hooks/use-billing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

const trustSchema = z.object({
  amount: z.coerce.number().min(1, "المبلغ يجب أن يكون أكبر من 0"),
  type: z.enum(["Deposit", "Withdrawal"]),
  description: z.string().min(3, "يرجى إدخال وصف للعملية"),
});

interface RecordTrustModalProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordTrustModal({
  caseId,
  open,
  onOpenChange,
}: RecordTrustModalProps) {
  const recordTrust = useRecordTrust();

  const form = useForm<z.infer<typeof trustSchema>>({
    resolver: zodResolver(trustSchema) as Resolver<z.infer<typeof trustSchema>>,
    defaultValues: {
      amount: 0,
      type: "Deposit",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof trustSchema>) => {
    recordTrust.mutate(
      { caseId, data: values },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-5 h-5 text-legal-gold" />
            إجراء معاملة أمانة
          </DialogTitle>
          <DialogDescription>
            سجل إيداع أو سحب من حساب الأمانة الخاص بهذه القضية.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع العملية</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent align="end">
                      <SelectItem value="Deposit">إيداع (+)</SelectItem>
                      <SelectItem value="Withdrawal">سحب (-)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف العملية</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثلاً: دفعة مقدمة للأتعاب"
                      className="text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 flex-row-reverse gap-2">
              <Button type="submit" disabled={recordTrust.isPending} className="w-full">
                {recordTrust.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                تأكيد المعاملة
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
