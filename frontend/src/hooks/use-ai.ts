import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useAIChat() {
  return useMutation({
    mutationFn: ({ prompt, context }: { prompt: string; context?: string }) => 
      aiService.chat(prompt, context),
  });
}

export function useSummarizeCase() {
  return useMutation({
    mutationFn: (caseId: string) => aiService.summarizeCase(caseId),
  });
}

export function useAnalyzeText() {
  return useMutation({
    mutationFn: (text: string) => aiService.analyzeText(text),
  });
}
