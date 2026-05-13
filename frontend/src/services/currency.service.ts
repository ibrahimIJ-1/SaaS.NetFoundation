import { apiClient } from './api-client';
import { Currency } from '@/types/currency';

export const currencyService = {
  getAll: async (): Promise<Currency[]> => {
    const res = await apiClient.get('/currencies');
    return res.data;
  },
  
  create: async (data: Partial<Currency>): Promise<Currency> => {
    const res = await apiClient.post('/currencies', data);
    return res.data;
  },
  
  update: async (id: string, data: Partial<Currency>): Promise<Currency> => {
    const res = await apiClient.put(`/currencies/${id}`, data);
    return res.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/currencies/${id}`);
  }
};
