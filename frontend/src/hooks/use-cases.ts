import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseService } from '@/services/case.service';
import { CreateCaseRequest } from '@/types/case';

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAllCases
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => caseService.getCaseById(id),
    enabled: !!id
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCaseRequest) => caseService.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => caseService.updateCase(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id] });
    }
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => caseService.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}

export function useCaseTimeline(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'timeline'],
    queryFn: () => caseService.getCaseTimeline(id),
    enabled: !!id
  });
}

export function useAddCaseNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, noteText }: { id: string; noteText: string }) => caseService.addCaseNote(id, noteText),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id, 'timeline'] });
    }
  });
}

export function useAddCaseStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => caseService.addCaseStage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id, 'timeline'] });
    }
  });
}

export function useAddCaseSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => caseService.addCaseSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id, 'timeline'] });
    }
  });
}

export function useAddCaseParty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => caseService.addCaseParty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.id] });
    }
  });
}

export function useUpdateCaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, noteText }: { noteId: string; noteText: string }) => caseService.updateCaseNote(noteId, noteText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}

export function useDeleteCaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => caseService.deleteCaseNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}

export function useUpdateCaseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) => caseService.updateCaseSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}

export function useDeleteCaseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => caseService.deleteCaseSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}

export function useCourtsLookup() {
  return useQuery({
    queryKey: ['lookup', 'courts'],
    queryFn: caseService.getCourtsLookup,
    staleTime: 300000 // 5 minutes
  });
}

export function useJudgesLookup() {
  return useQuery({
    queryKey: ['lookup', 'judges'],
    queryFn: caseService.getJudgesLookup,
    staleTime: 300000 // 5 minutes
  });
}

