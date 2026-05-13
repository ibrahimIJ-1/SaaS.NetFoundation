import { apiClient } from './api-client';

export const aiService = {
  chat: async (prompt: string, context?: string): Promise<{ response: string }> => {
    const response = await apiClient.post('/ai/chat', { prompt, context });
    return response.data;
  },

  summarizeCase: async (caseId: string): Promise<{ summary: string }> => {
    const response = await apiClient.post(`/ai/summarize-case/${caseId}`);
    return response.data;
  },

  analyzeText: async (text: string): Promise<{ analysis: string }> => {
    const response = await apiClient.post('/ai/analyze-text', text, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  transcribeVoice: async (audioBlob: Blob): Promise<{ transcription: string }> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    const response = await apiClient.post('/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
