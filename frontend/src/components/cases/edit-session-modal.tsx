"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateCaseSession, useCourtsLookup, useJudgesLookup } from "@/hooks/use-cases";
import { CourtSession } from "@/types/case";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { LookupInput } from "@/components/ui/lookup-input";
import { toast } from "sonner";

const sessionSchema = z.object({
  courtName: z.string().min(2, "اسم المحكمة مطلوب"),
  roomNumber: z.string().optional(),
  judgeName: z.string().optional(),
  sessionDate: z.string().min(1, "تاريخ الجلسة مطلوب"),
});

interface EditSessionModalProps {
  session: CourtSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSessionModal({
  session,
  open,
  onOpenChange,
}: EditSessionModalProps) {
  const updateSession = useUpdateCaseSession();
  const { data: courts } = useCourtsLookup();
  const { data: judges } = useJudgesLookup();

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      courtName: session.courtName,
      roomNumber: session.roomNumber || "",
      judgeName: session.judgeName || "",
      sessionDate: (() => {
        const d = new Date(session.sessionDate);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const h = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day}T${h}:${min}`;
      })(),
    },
  });

  const onSubmit = (values: z.infer<typeof sessionSchema>) => {
    updateSession.mutate(
      { sessionId: session.id, data: { ...values, sessionDate: new Date(values.sessionDate).toISOString() } },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("تم تحديث الجلسة");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-legal-gold" />
            تعديل بيانات الجلسة
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="courtName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المحكمة / الدائرة</FormLabel>
                  <FormControl>
                    <LookupInput 
                      options={courts || []} 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ والوقت</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="judgeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القاضي</FormLabel>
                    <FormControl>
                      <LookupInput 
                        options={judges || []} 
                        value={field.value || ""} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القاعة</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-right" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6 flex-row-reverse gap-2">
              <Button type="submit" disabled={updateSession.isPending} className="w-full">
                {updateSession.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
