import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddCaseSession, useCourtsLookup, useJudgesLookup } from "@/hooks/use-cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import { LookupInput } from "@/components/ui/lookup-input";


const sessionSchema = z.object({
  courtName: z.string().min(2, "اسم المحكمة مطلوب"),
  roomNumber: z.string().optional(),
  judgeName: z.string().optional(),
  sessionDate: z.string().min(1, "تاريخ الجلسة مطلوب"),
});

export function AddSessionForm({ caseId, onSuccess }: { caseId: string; onSuccess?: () => void }) {
  const addSession = useAddCaseSession();
  const { data: courts } = useCourtsLookup();
  const { data: judges } = useJudgesLookup();

  
  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      courtName: "",
      roomNumber: "",
      judgeName: "",
      sessionDate: "",
    },
  });

  const onSubmit = (data: z.infer<typeof sessionSchema>) => {
    // Ensure date is valid ISO
    const dateObj = new Date(data.sessionDate);
    if (isNaN(dateObj.getTime())) {
      toast.error("تاريخ غير صالح");
      return;
    }

    addSession.mutate(
      { id: caseId, data: { ...data, sessionDate: dateObj.toISOString() } },
      {
        onSuccess: () => {
          toast.success("تمت جدولة الجلسة بنجاح");
          form.reset();
          if (onSuccess) onSuccess();
        },
        onError: () => {
          toast.error("حدث خطأ أثناء جدولة الجلسة");
        }
      }
    );
  };

  return (
    <div className="mt-4 p-5 bg-secondary/20 rounded-xl border border-border">
      <h4 className="text-sm font-semibold text-foreground mb-4 font-heading flex items-center">
        <CalendarPlus className="w-4 h-4 ml-2 text-legal-gold" />
        جدولة جلسة جديدة
      </h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="courtName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">المحكمة / الدائرة</FormLabel>
                  <FormControl>
                    <LookupInput 
                      options={courts || []} 
                      value={field.value} 
                      onChange={field.onChange}
                      placeholder="اختر أو اكتب اسم المحكمة"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>

              )}
            />
            <FormField
              control={form.control}
              name="sessionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">التاريخ والوقت</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="bg-background h-9 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="judgeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">اسم القاضي (اختياري)</FormLabel>
                  <FormControl>
                    <LookupInput 
                      options={judges || []} 
                      value={field.value || ""} 
                      onChange={field.onChange}
                      placeholder="اختر أو اكتب اسم القاضي"
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
                  <FormLabel className="text-xs text-muted-foreground">القاعة (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: قاعة 3" className="bg-background h-9 text-sm" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={addSession.isPending}
              className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold text-sm h-9"
            >
              {addSession.isPending ? "جاري الحفظ..." : "حفظ الجلسة"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
