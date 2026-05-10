import { apiClient } from './api-client';
import { 
  MedicalHistory, 
  DentalChart, 
  UpdateToothConditionDto, 
  ToothHistoryItem 
} from '@/types/clinical';

export const clinicalService = {
  // Medical History
  getMedicalHistory: (patientId: string) => 
    apiClient.get<MedicalHistory>(`/tenant/patients/${patientId}/clinical/medical-history`).then(res => res.data),
  
  updateMedicalHistory: (patientId: string, data: Partial<MedicalHistory>) => 
    apiClient.put(`/tenant/patients/${patientId}/clinical/medical-history`, data).then(res => res.data),

  // Dental Chart (Odontogram)
  getDentalChart: (patientId: string) => 
    apiClient.get<DentalChart>(`/tenant/patients/${patientId}/clinical/dental-chart`).then(res => res.data),
  
  updateToothCondition: (patientId: string, data: UpdateToothConditionDto) => 
    apiClient.put(`/tenant/patients/${patientId}/clinical/dental-chart/tooth`, data).then(res => res.data),

  getToothHistory: (patientId: string, toothNumber: number) => 
    apiClient.get<ToothHistoryItem[]>(`/tenant/patients/${patientId}/clinical/dental-chart/tooth/${toothNumber}/history`).then(res => res.data),
};
