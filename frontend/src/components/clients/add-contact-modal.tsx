'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateContact } from '@/hooks/use-contacts';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Building2, Mail, Phone, Tag } from 'lucide-react';

const contactSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  type: z.enum(['Individual', 'Organization', 'Government'] as const),
  email: z.string().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),
  phoneNumber: z.string().min(5, 'رقم الهاتف مطلوب').optional().or(z.literal('')),
  identificationNumber: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  isClient: z.boolean(),
  notes: z.string().optional(),
  tags: z.string().optional(), // We'll split this by comma
});

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContactModal({ open, onOpenChange }: AddContactModalProps) {
  const createContact = useCreateContact();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      type: 'Individual',
      email: '',
      phoneNumber: '',
      identificationNumber: '',
      address: '',
      companyName: '',
      jobTitle: '',
      isClient: true,
      notes: '',
      tags: '',
    },
  });

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    const data = {
      ...values,
      tags: values.tags ? values.tags.split(',').map(t => t.trim()) : []
    };

    createContact.mutate(data, {
      onSuccess: () => {
        toast.success('تمت إضافة جهة الاتصال بنجاح');
        form.reset();
        onOpenChange(false);
      },
      onError: () => toast.error('حدث خطأ أثناء الإضافة'),
    });
  };

  const contactType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <User className="w-5 h-5 text-legal-gold" />
            إضافة جهة اتصال جديدة
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl><Input {...field} className="bg-secondary/20" placeholder="مثال: محمد أحمد" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>نوع الجهة</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val || 'Individual')} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/20">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Individual">فرد</SelectItem>
                      <SelectItem value="Organization">شركة / منظمة</SelectItem>
                      <SelectItem value="Government">جهة حكومية</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input {...field} className="pr-10 bg-secondary/20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input {...field} className="pr-10 bg-secondary/20 font-mono" dir="ltr" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {contactType !== 'Individual' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>اسم المنظمة</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} className="pr-10 bg-secondary/20" />
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="jobTitle" render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>المسمى الوظيفي (جهة الاتصال)</FormLabel>
                    <FormControl><Input {...field} className="bg-secondary/20" /></FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            <FormField control={form.control} name="identificationNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهوية / السجل التجاري</FormLabel>
                <FormControl><Input {...field} className="bg-secondary/20" /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl><Input {...field} className="bg-secondary/20" /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>الوسوم (مفصولة بفاصلة)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input {...field} className="pr-10 bg-secondary/20" placeholder="VIP, عميل دائم, شركة عقارية" />
                  </div>
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات إضافية</FormLabel>
                <FormControl><Textarea {...field} className="bg-secondary/20 min-h-[80px]" /></FormControl>
              </FormItem>
            )} />

            <DialogFooter className="pt-6 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
              <Button type="submit" className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold px-8" disabled={createContact.isPending}>
                {createContact.isPending ? 'جاري الحفظ...' : 'حفظ جهة الاتصال'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
