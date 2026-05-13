import { apiClient } from './api-client';

export enum LegalArea { 
  Criminal = 0, Civil = 1, Corporate = 2, Family = 3, 
  Labor = 4, IntellectualProperty = 5, Administrative = 6, Other = 7 
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  area: LegalArea;
  authorName?: string;
  isFirmWide: boolean;
  tags: string[];
  documentUrl?: string;
  createdAt: string;
}

export const knowledgeService = {
  getArticles: async (area?: LegalArea): Promise<KnowledgeArticle[]> => {
    const url = area !== undefined ? `/knowledge?area=${area}` : '/knowledge';
    const response = await apiClient.get(url);
    return response.data;
  },

  getArticleById: async (id: string): Promise<KnowledgeArticle> => {
    const response = await apiClient.get(`/knowledge/${id}`);
    return response.data;
  },

  createArticle: async (article: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    const response = await apiClient.post('/knowledge', article);
    return response.data;
  },

  deleteArticle: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge/${id}`);
  }
};
