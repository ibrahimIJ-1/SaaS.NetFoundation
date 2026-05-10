import { apiClient } from './api-client';
import { Room } from '@/types/clinical';

export const resourcesService = {
  getAll: () => apiClient.get<Room[]>('/tenant/resources').then(res => res.data),
  
  createRoom: (data: { name: string; description?: string }) => 
    apiClient.post<string>('/tenant/resources/rooms', data).then(res => res.data),
  
  createChair: (data: { name: string; roomId: string }) => 
    apiClient.post<string>('/tenant/resources/chairs', data).then(res => res.data),
};
