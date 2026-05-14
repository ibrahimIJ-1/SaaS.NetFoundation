import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { DocumentHighlight, DocumentAnnotation, DocumentVideoAnnotation } from '@/types/document';
import { toast } from 'sonner';

export function useCaseDocuments(caseId: string) {
  return useQuery({
    queryKey: ['documents', 'case', caseId],
    queryFn: () => documentService.getDocumentsByCase(caseId),
    enabled: !!caseId,
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: ['documents', 'all'],
    queryFn: documentService.getAllDocuments,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, file, parentId }: { caseId: string; file: File; parentId?: string }) => 
      documentService.uploadDocument(caseId, file, parentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'case', variables.caseId] });
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: ['documents', variables.parentId, 'versions'] });
      }
    }
  });
}

export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'versions'],
    queryFn: () => documentService.getVersions(documentId),
    enabled: !!documentId,
  });
}

export function usePromoteVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentService.promoteVersion(documentId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.legalCaseId] });
      toast.success("تم تعيين الإصدار كنسخة حالية");
    }
  });
}



export function useSaveHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, highlight }: { documentId: string; highlight: Omit<DocumentHighlight, 'id'> }) => 
      documentService.saveHighlight(documentId, highlight),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.documentId] });
    }
  });
}
export function useUpdateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ highlightId, highlight }: { highlightId: string; highlight: Partial<DocumentHighlight> }) => 
      documentService.updateHighlight(highlightId, highlight),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success("تم تحديث الملاحظة");
    }
  });
}

export function useSaveAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, annotation }: { documentId: string; annotation: Omit<DocumentAnnotation, 'id' | 'createdAt'> }) => 
      documentService.saveAnnotation(documentId, annotation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.documentId] });
    }
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (highlightId: string) => documentService.deleteHighlight(highlightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}

export function useDeleteAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotationId: string) => documentService.deleteAnnotation(annotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}

export function usePortalDocuments() {
  return useQuery({
    queryKey: ['documents', 'portal'],
    queryFn: () => documentService.getSharedDocuments(),
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, signerName, signatureImage }: { documentId: string; signerName: string; signatureImage: string }) => 
      documentService.signDocument(documentId, signerName, signatureImage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['portal-cases'] });
    }
  });
}

export function useToggleSharing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, isShared }: { documentId: string; isShared: boolean }) => 
      documentService.toggleSharing(documentId, isShared),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'case', data.legalCaseId] });
      toast.success(data.isSharedWithClient ? "تم مشاركة المستند مع الموكل" : "تم إلغاء مشاركة المستند");
    }
  });
}

export function useSaveVideoAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, annotation }: { documentId: string; annotation: Omit<DocumentVideoAnnotation, 'id' | 'createdAt'> }) =>
      documentService.saveVideoAnnotation(documentId, annotation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.documentId] });
    }
  });
}

export function useUpdateVideoAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ annotationId, annotation }: { annotationId: string; annotation: Partial<DocumentVideoAnnotation> }) =>
      documentService.updateVideoAnnotation(annotationId, annotation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}

export function useDeleteVideoAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotationId: string) => documentService.deleteVideoAnnotation(annotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}
