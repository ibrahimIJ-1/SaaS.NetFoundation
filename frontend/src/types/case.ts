export type CaseStatus = 'Active' | 'Pending' | 'Won' | 'Lost' | 'Archived';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Opponent {
  id: string;
  name: string;
  lawyerName?: string;
  notes?: string;
  partyType?: string;
}

export interface CaseStage {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface CourtSession {
  id: string;
  legalCaseId: string;
  sessionDate: string;
  courtName: string;
  judgeName?: string;
  roomNumber?: string;
  notes?: string;
  decision?: string;
}

export interface CaseNote {
  id: string;
  legalCaseId: string;
  noteText: string;
  authorName: string;
  date: string;
}

export interface CaseDocument {
  id: string;
  legalCaseId: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  caseType: string;
  status: CaseStatus;
  priority: Priority;
  courtInfo: string;
  assignedLawyerId: string;
  assignedLawyerName: string;
  openDate: string;
  closeDate?: string;
  description?: string;
  contactId?: string;
  tags?: string[];

  
  opponents?: Opponent[];
  stages?: CaseStage[];
  sessions?: CourtSession[];
  notes?: CaseNote[];
  documents?: CaseDocument[];
}

export interface CreateCaseRequest {
  caseNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  caseType: string;
  status: CaseStatus;
  priority: Priority;
  courtInfo: string;
  assignedLawyerId: string;
  assignedLawyerName: string;
  description?: string;
  tags?: string[];
}

export interface AddSessionRequest {
  courtName: string;
  roomNumber?: string;
  judgeName?: string;
  sessionDate: string;
  notes?: string;
}

export type TranscriptionStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface VoiceRecording {
  id: string;
  legalCaseId: string;
  courtSessionId?: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  durationSeconds: number;
  transcriptionStatus: TranscriptionStatus;
  transcriptionText?: string;
  errorMessage?: string;
  recordedAt: string;
}

export interface AddPartyRequest {
  name: string;
  lawyerName?: string;
  notes?: string;
  partyType: string;
}
