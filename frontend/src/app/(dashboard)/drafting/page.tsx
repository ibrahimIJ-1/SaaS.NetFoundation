'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { draftingService, LegalTemplate } from '@/services/drafting.service';
import { useCases } from '@/hooks/use-cases';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileSignature, 
  Wand2, 
  Copy, 
  Download, 
  Save, 
  FileText, 
  ChevronRight,
  History,
  Sparkles,
  Loader2,
  FileBadge
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DraftingAssistantPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');

  const { data: templates } = useQuery({
    queryKey: ['legal-templates'],
    queryFn: draftingService.getTemplates
  });

  const { data: cases } = useCases();

  const draftMutation = useMutation({
    mutationFn: () => draftingService.generateDraft(selectedTemplate, selectedCase),
    onSuccess: (data) => {
      setGeneratedDraft(data.draft);
      toast.success('تم إنشاء المسودة القانونية بنجاح!');
    },
    onError: () => {
      toast.error('فشل إنشاء المسودة. يرجى المحاولة لاحقاً.');
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    toast.info('تم نسخ المسودة إلى الحافظة.');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <FileSignature className="w-10 h-10 text-legal-gold" />
            المساعد الذكي للصياغة
          </h1>
          <p className="text-muted-foreground">قم بإنشاء العقود والمذكرات القانونية والإنذارات باستخدام الذكاء الاصطناعي.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-legal-gold/20">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-legal-gold" />
              إعدادات الصياغة
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">اختر القالب</label>
                <Select value={selectedTemplate} onValueChange={(val) => setSelectedTemplate(val || '')}>
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="قوالب المستندات..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                    {!templates?.length && <SelectItem value="none" disabled>لا توجد قوالب متاحة</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">اختر القضية / الموكل</label>
                <Select value={selectedCase} onValueChange={(val) => setSelectedCase(val || '')}>
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="استيراد بيانات من..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cases?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => draftMutation.mutate()}
                disabled={!selectedTemplate || !selectedCase || draftMutation.isPending}
                className="w-full bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold h-12 gap-2"
              >
                {draftMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                إنشاء المسودة الآن
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-secondary/20">
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <History className="w-4 h-4" /> سجل الصياغات الأخيرة
            </h4>
            <div className="space-y-2 opacity-50">
              <p className="text-[10px] italic">سيظهر هنا أرشيف المستندات التي قمت بصياغتها مؤخراً.</p>
            </div>
          </GlassCard>
        </div>

        {/* Drafting Workspace */}
        <div className="lg:col-span-2 h-full flex flex-col gap-6">
          <GlassCard className="flex-1 min-h-[600px] flex flex-col overflow-hidden bg-white/5 backdrop-blur-xl border-border shadow-2xl">
            <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-legal-gold" />
                <span className="text-sm font-bold">معاينة المسودة القانونية</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!generatedDraft}><Copy className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" disabled={!generatedDraft}><Download className="w-4 h-4" /></Button>
                <Button variant="secondary" size="sm" className="gap-2" disabled={!generatedDraft}>
                  <Save className="w-4 h-4" />
                  حفظ في المستندات
                </Button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              {!generatedDraft ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground/50">جاهز لبدء الصياغة</h3>
                    <p className="text-sm text-muted-foreground max-w-[300px]">اختر القالب وبيانات القضية من الجانب الأيمن لإنشاء مستند قانوني متكامل.</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap font-serif leading-loose text-lg">
                  {generatedDraft}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
