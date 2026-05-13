'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateCase } from '@/hooks/use-cases';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const caseSchema = z.object({
  caseNumber: z.string().min(1, 'رقم القضية مطلوب'),
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  clientId: z.string().min(1, 'معرف الموكل مطلوب'),
  clientName: z.string().min(2, 'اسم الموكل مطلوب'),
  caseType: z.string().min(2, 'نوع القضية مطلوب'),
  courtInfo: z.string().min(2, 'معلومات المحكمة مطلوبة'),
  assignedLawyerId: z.string().min(1, 'معرف المحامي مطلوب'),
  assignedLawyerName: z.string().min(2, 'اسم المحامي مطلوب'),
  status: z.enum(['Active', 'Pending', 'Archived']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  description: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

export default function NewCasePage() {
  const router = useRouter();
  const createCase = useCreateCase();

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      caseNumber: '',
      title: '',
      clientId: 'cli-' + Math.random().toString(36).substr(2, 9),
      clientName: '',
      caseType: 'مدني',
      courtInfo: '',
      assignedLawyerId: 'law-1',
      assignedLawyerName: 'المحامي الأول',
      status: 'Active',
      priority: 'Medium',
      description: '',
    },
  });

  const onSubmit = (data: CaseFormValues) => {
    createCase.mutate(
      data,
      {
        onSuccess: (newCase) => {
          toast.success('تم إنشاء القضية بنجاح');
          router.push(`/cases/${newCase.id}`);
        },
        onError: () => {
          toast.error('حدث خطأ أثناء إنشاء القضية');
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">قضية جديدة</h1>
        <p className="text-muted-foreground mt-1">أدخل تفاصيل القضية الجديدة للنظام.</p>
      </div>

      <GlassCard className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">رقم القضية</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 2024/150" className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">عنوان/موضوع القضية</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: مطالبة مالية" className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">اسم الموكل</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم الموكل" className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">تصنيف القضية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="مدني">مدني</SelectItem>
                        <SelectItem value="تجاري">تجاري</SelectItem>
                        <SelectItem value="عمالي">عمالي</SelectItem>
                        <SelectItem value="جزائي">جزائي</SelectItem>
                        <SelectItem value="أحوال شخصية">أحوال شخصية</SelectItem>
                        <SelectItem value="إداري">إداري</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courtInfo"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-foreground">المحكمة / الدائرة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: محكمة الاستئناف بدمشق" className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">حالة القضية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">نشطة</SelectItem>
                        <SelectItem value="Pending">قيد الانتظار</SelectItem>
                        <SelectItem value="Archived">مؤرشفة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">منخفضة</SelectItem>
                        <SelectItem value="Medium">متوسطة</SelectItem>
                        <SelectItem value="High">عالية</SelectItem>
                        <SelectItem value="Urgent">حرجة جداً</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-foreground">وصف القضية والوقائع</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل ملخص الوقائع هنا..." 
                        className="bg-background min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" className="border-border text-muted-foreground hover:bg-secondary" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold" disabled={createCase.isPending}>
                {createCase.isPending ? 'جاري الحفظ...' : 'حفظ القضية'}
              </Button>
            </div>
          </form>
        </Form>
      </GlassCard>
    </div>
  );
}
