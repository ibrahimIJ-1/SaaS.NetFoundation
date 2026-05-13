import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddCaseParty } from "@/hooks/use-cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const partySchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  partyType: z.string().min(1, "الصفة مطلوبة"),
  lawyerName: z.string().optional(),
});

export function AddPartyForm({
  caseId,
  onSuccess,
}: {
  caseId: string;
  onSuccess?: () => void;
}) {
  const addParty = useAddCaseParty();

  const form = useForm<z.infer<typeof partySchema>>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: "",
      partyType: "Opponent",
      lawyerName: "",
    },
  });

  const onSubmit = (data: z.infer<typeof partySchema>) => {
    addParty.mutate(
      { id: caseId, data },
      {
        onSuccess: () => {
          toast.success("تمت إضافة الطرف بنجاح");
          form.reset();
          if (onSuccess) onSuccess();
        },
        onError: () => {
          toast.error("حدث خطأ أثناء الإضافة");
        },
      },
    );
  };

  return (
    <div className="mt-4 p-5 bg-secondary/20 rounded-xl border border-border">
      <h4 className="text-sm font-semibold text-foreground mb-4 font-heading flex items-center">
        <UserPlus className="w-4 h-4 ml-2 text-legal-gold" />
        إضافة طرف جديد للقضية
      </h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    الاسم
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="اسم الشخص أو الشركة"
                      className="bg-background h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    الصفة
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background h-9 text-sm border-border">
                        <SelectValue placeholder="اختر الصفة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Plaintiff">مدعي</SelectItem>
                      <SelectItem value="Defendant">مدعى عليه</SelectItem>
                      <SelectItem value="Witness">شاهد</SelectItem>
                      <SelectItem value="Representative">
                        ممثل قانوني
                      </SelectItem>
                      <SelectItem value="Opponent">خصم (عام)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lawyerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    المحامي الممثل (اختياري)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="اسم محامي الخصم"
                      className="bg-background h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={addParty.isPending}
              className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold text-sm h-9"
            >
              {addParty.isPending ? "جاري الإضافة..." : "إضافة الطرف"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
