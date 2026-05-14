import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { toast } from 'sonner';

export function useAIChat() {
  return useMutation({
    mutationFn: ({ prompt, context }: { prompt: string; context?: string }) => 
      aiService.chat(prompt, context),
    onError: (err: any) => toast.error(err?.response?.data || 'فشلت المحادثة مع الذكاء الاصطناعي'),
  });
}

export function useSummarizeCase() {
  return useMutation({
    mutationFn: (caseId: string) => aiService.summarizeCase(caseId),
    onError: (err: any) => toast.error(err?.response?.data || 'فشل تلخيص القضية'),
  });
}

export function useAnalyzeText() {
  return useMutation({
    mutationFn: (text: string) => aiService.analyzeText(text),
    onError: (err: any) => toast.error(err?.response?.data || 'فشل تحليل النص'),
  });
}
