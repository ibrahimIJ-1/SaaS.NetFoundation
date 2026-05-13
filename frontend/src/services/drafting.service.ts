import { apiClient } from './api-client';

export interface LegalTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: string;
  language: string;
}

export const draftingService = {
  getTemplates: async (): Promise<LegalTemplate[]> => {
    const response = await apiClient.get('/drafting/templates');
    return response.data;
  },

  generateDraft: async (templateId: string, caseId: string): Promise<{ draft: string }> => {
    const response = await apiClient.post('/drafting/generate', { templateId, caseId });
    return response.data;
  }
};
