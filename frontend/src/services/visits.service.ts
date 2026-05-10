import { apiClient } from './api-client';
import { Visit, UpdateVisitNotesDto } from '@/types/clinical';

export const visitsService = {
  getById: (id: string) => 
    apiClient.get<Visit>(`/tenant/visits/${id}`).then(res => res.data),
    
  getByPatient: (patientId: string) => 
    apiClient.get<Visit[]>(`/tenant/visits/patient/${patientId}`).then(res => res.data),
    
  start: (appointmentId: string) => 
    apiClient.post<string>('/tenant/visits/start', { appointmentId }).then(res => res.data),
    
  updateNotes: (id: string, data: UpdateVisitNotesDto) => 
    apiClient.put(`/tenant/visits/${id}/notes`, data).then(res => res.data),
    
  complete: (id: string) => 
    apiClient.put(`/tenant/visits/${id}/complete`).then(res => res.data),
};
