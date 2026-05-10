import { apiClient } from './api-client';
import { Patient, CreatePatientDto } from '@/types/clinical';

export const patientsService = {
  getAll: () => apiClient.get<Patient[]>('/tenant/patients').then(res => res.data),
  getById: (id: string) => apiClient.get<Patient>(`/tenant/patients/${id}`).then(res => res.data),
  create: (data: CreatePatientDto) => apiClient.post<string>('/tenant/patients', data).then(res => res.data),
  update: (id: string, data: Partial<CreatePatientDto>) => apiClient.put(`/tenant/patients/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/tenant/patients/${id}`).then(res => res.data),
};
