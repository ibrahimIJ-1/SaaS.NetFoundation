import { apiClient } from './api-client';
import { CaseDocument, DocumentHighlight, DocumentAnnotation, DocumentVideoAnnotation } from '@/types/document';

export const documentService = {
  getDocumentsByCase: async (caseId: string): Promise<CaseDocument[]> => {
    const response = await apiClient.get(`/documents/case/${caseId}`);
    return response.data;
  },

  getSharedDocuments: async (): Promise<CaseDocument[]> => {
    const response = await apiClient.get('/documents/shared');
    return response.data;
  },

  getAllDocuments: async (): Promise<CaseDocument[]> => {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  getDocumentById: async (id: string): Promise<CaseDocument> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (caseId: string, file: File, parentId?: string): Promise<CaseDocument> => {
    const formData = new FormData();
    formData.append('caseId', caseId);
    formData.append('file', file);
    
    const url = `/documents/upload${parentId ? `?parentId=${parentId}` : ''}`;
    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getVersions: async (documentId: string): Promise<CaseDocument[]> => {
    const response = await apiClient.get(`/documents/${documentId}/versions`);
    return response.data;
  },

  promoteVersion: async (documentId: string): Promise<CaseDocument> => {
    const response = await apiClient.post(`/documents/${documentId}/promote`);
    return response.data;
  },



  saveHighlight: async (documentId: string, highlight: Omit<DocumentHighlight, 'id'>): Promise<DocumentHighlight> => {
    const response = await apiClient.post(`/documents/${documentId}/highlights`, highlight);
    return response.data;
  },

  updateHighlight: async (highlightId: string, highlight: Partial<DocumentHighlight>): Promise<DocumentHighlight> => {
    const response = await apiClient.patch(`/documents/highlights/${highlightId}`, highlight);
    return response.data;
  },


  deleteHighlight: async (highlightId: string): Promise<void> => {
    await apiClient.delete(`/documents/highlights/${highlightId}`);
  },

  saveAnnotation: async (documentId: string, annotation: Omit<DocumentAnnotation, 'id' | 'createdAt'>): Promise<DocumentAnnotation> => {
    const response = await apiClient.post(`/documents/${documentId}/annotations`, annotation);
    return response.data;
  },

  deleteAnnotation: async (annotationId: string): Promise<void> => {
    await apiClient.delete(`/documents/annotations/${annotationId}`);
  },

  toggleSharing: async (id: string, isShared: boolean): Promise<CaseDocument> => {
    const response = await apiClient.patch(`/documents/${id}/share`, isShared);
    return response.data;
  },

  signDocument: async (id: string, signerName: string, signatureImage: string): Promise<any> => {
    const response = await apiClient.post(`/documents/${id}/sign`, { signerName, signatureImage });
    return response.data;
  },

  saveVideoAnnotation: async (documentId: string, annotation: Omit<DocumentVideoAnnotation, 'id' | 'createdAt'>): Promise<DocumentVideoAnnotation> => {
    const response = await apiClient.post(`/documents/${documentId}/video-annotations`, annotation);
    return response.data;
  },

  updateVideoAnnotation: async (annotationId: string, annotation: Partial<DocumentVideoAnnotation>): Promise<DocumentVideoAnnotation> => {
    const response = await apiClient.patch(`/documents/video-annotations/${annotationId}`, annotation);
    return response.data;
  },

  deleteVideoAnnotation: async (annotationId: string): Promise<void> => {
    await apiClient.delete(`/documents/video-annotations/${annotationId}`);
  },

  createFromImages: async (caseId: string, files: File[], order: string[]): Promise<CaseDocument> => {
    const formData = new FormData();
    formData.append('caseId', caseId);
    files.forEach((f) => formData.append('files', f));
    formData.append('order', order.join(','));
    const response = await apiClient.post('/documents/create-from-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  runOcr: async (documentId: string): Promise<{ originalId: string; ocrDocument: CaseDocument }> => {
    const response = await apiClient.post(`/documents/${documentId}/ocr`);
    return response.data;
  }
};
