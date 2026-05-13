'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUnbilledSummary, useBulkGenerateInvoices } from '@/hooks/use-billing';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase,
  ChevronRight,
  Zap,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UnbilledSummaryItem } from '@/types/billing';

export default function BulkBillingPage() {
  const { data: unbilled, isLoading } = useUnbilledSummary();
  const bulkGenerate = useBulkGenerateInvoices();
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  const toggleCase = (id: string) => {
    setSelectedCases(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCases.length === unbilled?.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(unbilled?.map((c: UnbilledSummaryItem) => c.caseId) || []);
    }

  };

  const handleGenerate = async () => {
    if (selectedCases.length === 0) return;
    
    bulkGenerate.mutate(selectedCases, {
      onSuccess: (data: any) => {
        toast.success(`تم إنشاء ${data.generatedCount} فاتورة مسودة بنجاح`);
        setSelectedCases([]);
      },
      onError: () => {
        toast.error('حدث خطأ أثناء إنشاء الفواتير');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/billing">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
              <Zap className="w-8 h-8 text-legal-gold" />
              الفواتير السريعة
            </h1>
            <p className="text-muted-foreground mt-1">إنشاء فواتير مجمعة لكافة المصاريف غير المفوترة.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAll}
                className="text-xs"
              >
                {selectedCases.length === unbilled?.length ? 'إلغاء الكل' : 'تحديد الكل'}
              </Button>
              <span className="text-sm text-muted-foreground">
                تم تحديد {selectedCases.length} من {unbilled?.length || 0} قضية
              </span>
            </div>
            
            <Button 
              className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold gap-2"
              disabled={selectedCases.length === 0 || bulkGenerate.isPending}
              onClick={handleGenerate}
            >
              <CheckCircle2 className="w-4 h-4" />
              {bulkGenerate.isPending ? 'جاري الإنشاء...' : 'إنشاء مسودات الفواتير'}
            </Button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">جاري تحميل البيانات...</div>
          ) : unbilled?.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-muted-foreground/30">
                <Receipt className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground">لا توجد مصاريف غير مفوترة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unbilled?.map((item: UnbilledSummaryItem) => (
                <GlassCard 
                  key={item.caseId} 
                  className={cn(
                    "p-5 cursor-pointer transition-all border-2 relative group",
                    selectedCases.includes(item.caseId) 
                      ? "border-legal-gold bg-legal-gold/5" 
                      : "border-transparent hover:border-border"
                  )}
                  onClick={() => toggleCase(item.caseId)}
                >
                  {selectedCases.includes(item.caseId) && (
                    <div className="absolute top-3 left-3 bg-legal-gold text-legal-primary rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0 group-hover:bg-legal-gold/10 group-hover:text-legal-gold transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-mono">{item.caseNumber}</p>
                      <h3 className="font-bold text-foreground truncate">{item.caseTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{item.clientName}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {item.unbilledExpenseCount} مصروفات
                          </Badge>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">الإجمالي</p>
                          <p className="text-lg font-bold text-foreground">${item.unbilledExpenseTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-legal-gold" />
              كيف يعمل النظام؟
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                <span>يقوم النظام بالبحث عن كافة المصاريف المرتبطة بالقضايا والتي لم يتم تضمينها في أي فاتورة سابقة.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                <span>عند الضغط على "إنشاء"، سيتم إنشاء فاتورة "مسودة" لكل قضية مختارة بشكل منفصل.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                <span>يمكنك لاحقاً مراجعة المسودات، تعديلها، ثم إرسالها للموكلين بشكل رسمي.</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6 bg-legal-gold/5 border-legal-gold/20">
            <h3 className="font-bold text-legal-gold mb-2">توفير الوقت</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              هذه الميزة مصممة لتوفير ساعات من العمل الإداري. بدلاً من إنشاء فاتورة لكل قضية يدوياً، يمكنك الآن فوترة الشهر كاملاً في أقل من دقيقة.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
