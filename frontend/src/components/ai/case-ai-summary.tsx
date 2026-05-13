'use client';

import { useState } from 'react';
import { useSummarizeCase } from '@/hooks/use-ai';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseAISummaryProps {
  caseId: string;
}

export function CaseAISummary({ caseId }: CaseAISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const summarizeMutation = useSummarizeCase();

  const handleSummarize = () => {
    summarizeMutation.mutate(caseId, {
      onSuccess: (data) => setSummary(data.summary),
    });
  };

  if (!summary && !summarizeMutation.isPending) {
    return (
      <Button 
        onClick={handleSummarize} 
        variant="outline" 
        className="w-full border-legal-gold/30 hover:border-legal-gold hover:bg-legal-gold/10 text-legal-gold gap-2 py-6"
      >
        <Sparkles className="w-4 h-4" />
        توليد ملخص ذكي للقضية بواسطة AI
      </Button>
    );
  }

  return (
    <GlassCard className="overflow-hidden border-legal-gold/20">
      <div 
        className="p-4 bg-legal-gold/5 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-legal-gold">
          <Sparkles className={cn("w-4 h-4", summarizeMutation.isPending && "animate-spin")} />
          <span className="font-bold text-sm font-heading">الملخص الذكي (AI Summary)</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-secondary/10">
          {summarizeMutation.isPending ? (
            <div className="flex flex-col items-center py-6 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs">جاري تحليل مستندات وملاحظات القضية...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
              <div className="mt-4 flex justify-between items-center border-t border-border pt-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  تم التوليد بناءً على ملاحظات ومراحل القضية الحالية.
                </span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={handleSummarize}>
                  تحديث
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
