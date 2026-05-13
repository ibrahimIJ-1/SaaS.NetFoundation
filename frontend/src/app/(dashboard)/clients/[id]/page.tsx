'use client';

import { useContact, useClientSummary, useAddInteraction } from '@/hooks/use-contacts';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  History,
  Receipt,
  Plus,
  MessageSquare,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: contact, isLoading: contactLoading } = useContact(id);
  const { data: summary, isLoading: summaryLoading } = useClientSummary(id);

  if (contactLoading) return <div className="p-20 text-center">جاري تحميل الملف...</div>;
  if (!contact) return <div className="p-20 text-center text-legal-danger">الموكل غير موجود.</div>;

  return (
    <div className="space-y-6">
      {/* Header / Profile Info */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowRight className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-legal-gold/10 flex items-center justify-center text-legal-gold border border-legal-gold/20 shadow-lg">
              {contact.type === 'Individual' ? <User className="w-10 h-10" /> : <Building2 className="w-10 h-10" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-heading">{contact.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-secondary/50">{contact.type === 'Individual' ? 'فرد' : 'منظمة'}</Badge>
                {contact.isClient && <Badge className="bg-legal-gold text-legal-primary font-bold">موكل</Badge>}
                <span className="text-sm text-muted-foreground ml-2">ID: {contact.identificationNumber || '-'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contact.email && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-xl border border-border">
                <Mail className="w-4 h-4 text-legal-gold" />
                {contact.email}
              </div>
            )}
            {contact.phoneNumber && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-xl border border-border" dir="ltr">
                <Phone className="w-4 h-4 text-legal-gold" />
                {contact.phoneNumber}
              </div>
            )}
            {contact.address && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-xl border border-border">
                <MapPin className="w-4 h-4 text-legal-gold" />
                {contact.address}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">تعديل البيانات</Button>
          <Button variant="outline">تواصل</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Stats & Meta */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-foreground font-heading mb-4 border-b border-border pb-2">ملخص النشاط</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">إجمالي القضايا</span>
                <span className="font-bold text-foreground">{summary?.totalCases ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">قضايا نشطة</span>
                <span className="font-bold text-legal-gold">{summary?.activeCases ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">المستحقات المتبقية</span>
                <span className="font-bold text-legal-danger">${summary?.outstandingBalance.toLocaleString() ?? '0'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">رصيد الأمانة</span>
                <span className="font-bold text-green-400">${summary?.trustBalance.toLocaleString() ?? '0'}</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs text-legal-gold">عرض الفواتير بالتفصيل</Button>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-foreground font-heading mb-4 border-b border-border pb-2">معلومات إضافية</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">الشركة / الجهة</p>
                <p className="text-foreground font-medium">{contact.companyName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">المسمى الوظيفي</p>
                <p className="text-foreground font-medium">{contact.jobTitle || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">تاريخ التسجيل</p>
                <p className="text-foreground font-medium">{new Date(contact.createdAt).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Dynamic Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="cases" className="w-full">
            <TabsList className="bg-secondary p-1 border border-border h-12">
              <TabsTrigger value="cases" className="px-6 data-[state=active]:bg-background flex gap-2">
                <Briefcase className="w-4 h-4" />
                القضايا
              </TabsTrigger>
              <TabsTrigger value="interactions" className="px-6 data-[state=active]:bg-background flex gap-2">
                <History className="w-4 h-4" />
                سجل التواصل
              </TabsTrigger>
              <TabsTrigger value="billing" className="px-6 data-[state=active]:bg-background flex gap-2">
                <Receipt className="w-4 h-4" />
                المالية
              </TabsTrigger>
              <TabsTrigger value="documents" className="px-6 data-[state=active]:bg-background flex gap-2">
                <FileText className="w-4 h-4" />
                المستندات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="mt-6 space-y-4">
              {contact.cases?.length === 0 ? (
                <GlassCard className="p-10 text-center text-muted-foreground italic">لا توجد قضايا مسجلة لهذا الموكل.</GlassCard>
              ) : contact.cases?.map(c => (
                <GlassCard key={c.id} className="p-4 flex justify-between items-center hover:border-legal-gold/30 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 rounded-xl bg-secondary/50 text-legal-gold"><Briefcase className="w-5 h-5" /></div>
                    <div>
                      <h4 className="font-bold text-foreground">{c.title}</h4>
                      <p className="text-xs text-muted-foreground">رقم: {c.caseNumber} • {c.caseType}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => router.push(`/cases/${c.id}`)}>عرض القضية</Button>
                </GlassCard>
              ))}
              <Button variant="outline" className="w-full border-dashed border-2 py-8 hover:bg-secondary/20">
                <Plus className="w-4 h-4 ml-2" />
                فتح قضية جديدة لهذا الموكل
              </Button>
            </TabsContent>

            <TabsContent value="interactions" className="mt-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground font-heading">الجدول الزمني للتواصل</h3>
                <Button size="sm" variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  تسجيل تواصل جديد
                </Button>
              </div>

              <div className="space-y-4 relative before:absolute before:right-6 before:top-4 before:bottom-4 before:w-px before:bg-border">
                {contact.interactions?.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground italic">لا يوجد سجل تواصل مسبق.</p>
                ) : contact.interactions?.map(i => (
                  <div key={i.id} className="relative pr-12">
                    <div className="absolute right-4 top-1 w-4 h-4 rounded-full bg-legal-gold border-4 border-background" />
                    <GlassCard className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-legal-gold uppercase">{i.type}</span>
                        <span className="text-xs text-muted-foreground">{new Date(i.interactionDate).toLocaleString('ar-SA')}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{i.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">بواسطة: {i.authorName || 'النظام'}</p>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="billing" className="mt-6">
              <GlassCard className="p-10 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground font-heading mb-2">السجل المالي للموكل</h3>
                <p className="text-muted-foreground mb-6">عرض جميع الفواتير والدفعات وحسابات الأمانة المتعلقة بجميع قضايا هذا الموكل.</p>
                <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">كشف حساب موحد</Button>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
