export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationalId?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationalId?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface MedicalHistory {
  patientId: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  generalNotes?: string;
}

export type ToothStatus = 
  | 'Healthy' 
  | 'Caries' 
  | 'Filling' 
  | 'RootCanal' 
  | 'Crown' 
  | 'Bridge' 
  | 'Implant' 
  | 'Missing' 
  | 'Impacted' 
  | 'Fractured' 
  | 'Mobility' 
  | 'Gingivitis' 
  | 'ExtractionNeeded';

export interface ToothCondition {
  toothNumber: number;
  status: ToothStatus;
  notes?: string;
  lastUpdated: string;
}

export interface DentalChart {
  patientId: string;
  teeth: ToothCondition[];
}

export interface UpdateToothConditionDto {
  toothNumber: number;
  status: ToothStatus;
  notes?: string;
}

export interface ToothHistoryItem {
  date: string;
  type: string;
  description: string;
  notes?: string;
  doctorName?: string;
  visitId?: string;
}

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Arrived' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName?: string;
  chairId?: string;
  chairName?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  statusName: string;
  reason?: string;
  notes?: string;
  visitId?: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  chairs: Chair[];
}

export interface Chair {
  id: string;
  name: string;
  isOperational: boolean;
  roomId: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  chairId?: string;
  startTime: string;
  endTime: string;
  reason?: string;
  notes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  chiefComplaint?: string;
  subjectiveNotes?: string;
  objectiveNotes?: string;
  assessment?: string;
  plan?: string;
}

export interface UpdateVisitNotesDto {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

export type TreatmentPlanStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';
export type ProcedureStatus = 'Proposed' | 'InProgress' | 'Completed' | 'Cancelled';

export interface TreatmentPlanItem {
  id: string;
  procedureName: string;
  code?: string;
  toothNumber?: number;
  surface?: string;
  cost: number;
  status: ProcedureStatus;
  completionDate?: string;
}

export interface TreatmentPlan {
  id: string;
  title: string;
  status: TreatmentPlanStatus;
  notes?: string;
  createdAt: string;
  items: TreatmentPlanItem[];
  totalCost: number;
}

export interface CreateTreatmentPlanItemDto {
  procedureName: string;
  code?: string;
  toothNumber?: number;
  surface?: string;
  cost: number;
}

export interface CreateTreatmentPlanDto {
  patientId: string;
  doctorId: string;
  title: string;
  notes?: string;
  items: CreateTreatmentPlanItemDto[];
}

