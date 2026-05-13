'use client';

import { useState } from 'react';
import { useDocument } from '@/hooks/use-documents';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft,
  Columns,
  Maximize2,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  ArrowLeftRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentComparisonProps {
  docId1: string;
  docId2: string;
  onClose: () => void;
}

export function DocumentComparison({ docId1, docId2, onClose }: DocumentComparisonProps) {
  const { data: doc1, isLoading: loading1 } = useDocument(docId1);
  const { data: doc2, isLoading: loading2 } = useDocument(docId2);
  const [syncScroll, setSyncScroll] = useState(true);

  if (loading1 || loading2) return <div className="p-20 text-center">جاري تحميل المستندات للمقارنة...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={onClose}><ChevronRight className="w-5 h-5" /></Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-legal-gold/10 rounded-lg text-legal-gold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-heading leading-tight">مقارنة المستندات</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">وضع التحليل المتقاطع</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-full border border-border">
          <Button 
            variant={syncScroll ? 'secondary' : 'ghost'} 
            size="sm" 
            className="rounded-full gap-2 text-xs"
            onClick={() => setSyncScroll(!syncScroll)}
          >
            {syncScroll ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            التمرير المتزامن
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><RefreshCw className="w-3 h-3" /></Button>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
             <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{doc1?.fileName}</p>
             <p className="text-[10px] text-muted-foreground">مقابل</p>
             <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{doc2?.fileName}</p>
           </div>
           <Button variant="outline" size="icon" className="rounded-full"><Maximize2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-4 gap-4 bg-secondary/20">
        {/* Document 1 */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">المستند الأول</span>
            <span className="text-[10px] text-muted-foreground">{new Date(doc1?.uploadDate!).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-xl border border-border overflow-hidden relative group">
            <iframe src={doc1?.fileUrl} className="w-full h-full border-none" />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg"><Search className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Separator / Divider */}
        <div className="w-px bg-border self-stretch my-10 hidden lg:block" />

        {/* Document 2 */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">المستند الثاني</span>
            <span className="text-[10px] text-muted-foreground">{new Date(doc2?.uploadDate!).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-xl border border-border overflow-hidden relative group">
            <iframe src={doc2?.fileUrl} className="w-full h-full border-none" />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg"><Search className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Analysis Info */}
      <div className="h-10 border-t border-border bg-card/80 flex items-center justify-center gap-8 px-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5"><Columns className="w-3 h-3" /> وضع المقارنة العمودية</span>
        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
        <span className="flex items-center gap-1.5 text-legal-gold"><Lock className="w-3 h-3" /> التزامن النشط</span>
        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
        <span className="flex items-center gap-1.5">الدقة العالية: 100%</span>
      </div>
    </div>
  );
}
