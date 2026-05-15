import { apiClient } from './api-client';
import type { VoiceRecording } from '@/types/case';

export const voiceRecordingService = {
  upload: async (file: Blob, fileName: string, legalCaseId: string, courtSessionId?: string): Promise<VoiceRecording> => {
    const formData = new FormData();
    formData.append('file', file, fileName);
    const params = new URLSearchParams({ legalCaseId });
    if (courtSessionId) params.set('courtSessionId', courtSessionId);
    const response = await apiClient.post(`/voice-recordings?${params.toString()}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getByCase: async (caseId: string): Promise<VoiceRecording[]> => {
    const response = await apiClient.get(`/voice-recordings/case/${caseId}`);
    return response.data;
  },

  getBySession: async (sessionId: string): Promise<VoiceRecording[]> => {
    const response = await apiClient.get(`/voice-recordings/session/${sessionId}`);
    return response.data;
  },

  getById: async (id: string): Promise<VoiceRecording> => {
    const response = await apiClient.get(`/voice-recordings/${id}`);
    return response.data;
  },

  transcribe: async (id: string): Promise<void> => {
    await apiClient.post(`/voice-recordings/${id}/transcribe`);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/voice-recordings/${id}`);
  }
};
