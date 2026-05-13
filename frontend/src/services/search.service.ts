import { apiClient } from './api-client';

export interface SearchResults {
  cases: Array<{ id: string; title: string; caseNumber: string; type: string }>;
  contacts: Array<{ id: string; name: string; type: string }>;
  documents: Array<{ id: string; fileName: string; legalCaseId: string; type: string; hasMatchInContent: boolean }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  searchParamsJson: string;
  icon?: string;
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResults> => {
    const response = await apiClient.get(`/search/global?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const response = await apiClient.get('/search/saved');
    return response.data;
  },

  saveSearch: async (name: string, params: any): Promise<SavedSearch> => {
    const response = await apiClient.post('/search/saved', {
      name,
      searchParamsJson: JSON.stringify(params)
    });
    return response.data;
  },

  deleteSavedSearch: async (id: string): Promise<void> => {
    await apiClient.delete(`/search/saved/${id}`);
  }
};
