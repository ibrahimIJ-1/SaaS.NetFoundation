import { apiClient } from './api-client';
import { LegalCase, CreateCaseRequest, CaseNote, CaseStage, CourtSession, Opponent, AddSessionRequest, AddPartyRequest } from '@/types/case';

export const caseService = {
  getAllCases: async (): Promise<LegalCase[]> => {
    const response = await apiClient.get('/cases');
    return response.data;
  },

  getCaseById: async (id: string): Promise<LegalCase> => {
    const response = await apiClient.get(`/cases/${id}`);
    return response.data;
  },

  createCase: async (data: CreateCaseRequest): Promise<LegalCase> => {
    const response = await apiClient.post('/cases', data);
    return response.data;
  },

  updateCase: async (id: string, data: Partial<LegalCase>): Promise<void> => {
    await apiClient.put(`/cases/${id}`, data);
  },

  deleteCase: async (id: string): Promise<void> => {
    await apiClient.delete(`/cases/${id}`);
  },

  getCaseTimeline: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/cases/${id}/timeline`);
    return response.data;
  },

  addCaseNote: async (id: string, noteText: string): Promise<CaseNote> => {
    const response = await apiClient.post(`/cases/${id}/notes`, { noteText });
    return response.data;
  },

  addCaseStage: async (id: string, data: Partial<CaseStage>): Promise<CaseStage> => {
    const response = await apiClient.post(`/cases/${id}/stages`, data);
    return response.data;
  },

  addCaseSession: async (id: string, data: AddSessionRequest): Promise<CourtSession> => {
    const response = await apiClient.post(`/cases/${id}/sessions`, data);
    return response.data;
  },

  addCaseParty: async (id: string, data: AddPartyRequest): Promise<Opponent> => {
    const response = await apiClient.post(`/cases/${id}/parties`, data);
    return response.data;
  },

  updateCaseNote: async (noteId: string, noteText: string): Promise<CaseNote> => {
    const response = await apiClient.patch(`/cases/notes/${noteId}`, { noteText });
    return response.data;
  },

  deleteCaseNote: async (noteId: string): Promise<void> => {
    await apiClient.delete(`/cases/notes/${noteId}`);
  },

  updateCaseSession: async (sessionId: string, data: AddSessionRequest): Promise<CourtSession> => {
    const response = await apiClient.patch(`/cases/sessions/${sessionId}`, data);
    return response.data;
  },

  deleteCaseSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/cases/sessions/${sessionId}`);
  },

  getCourtsLookup: async (): Promise<string[]> => {
    const response = await apiClient.get('/cases/lookup/courts');
    return response.data;
  },

  getJudgesLookup: async (): Promise<string[]> => {
    const response = await apiClient.get('/cases/lookup/judges');
    return response.data;
  },

  getDocumentVersions: async (documentId: string): Promise<any[]> => {
    const response = await apiClient.get(`/cases/documents/${documentId}/versions`);
    return response.data;
  },

  getSessionNotes: async (sessionId: string): Promise<CaseNote[]> => {
    const response = await apiClient.get(`/cases/sessions/${sessionId}/notes`);
    return response.data;
  },

  addSessionNote: async (sessionId: string, noteText: string): Promise<CaseNote> => {
    const response = await apiClient.post(`/cases/sessions/${sessionId}/notes`, { noteText });
    return response.data;
  }
};


