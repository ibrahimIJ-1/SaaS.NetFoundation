import { apiClient } from './api-client';
import { TreatmentPlan, CreateTreatmentPlanDto, ProcedureStatus } from '@/types/clinical';

export const treatmentPlansService = {
  getByPatient: (patientId: string) => 
    apiClient.get<TreatmentPlan[]>(`/treatment-plans/patient/${patientId}`).then(res => res.data),
    
  create: (data: CreateTreatmentPlanDto) => 
    apiClient.post<string>('/treatment-plans', data).then(res => res.data),
    
  updateItemStatus: (itemId: string, status: ProcedureStatus, visitId?: string) => 
    apiClient.put(`/treatment-plans/items/${itemId}/status`, { status, visitId }).then(res => res.data),
};
