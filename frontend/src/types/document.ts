export interface DocumentHighlight {
  id: string;
  documentId: string;
  color: string;
  textContent?: string;
  pageNumber: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  rectsJson?: string;
  label?: string;
  comment?: string;
}

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  pageNumber: number;
  x: number;
  y: number;
  comment: string;
  authorName?: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface CaseDocument {
  id: string;
  legalCaseId: string;
  legalCase?: {
    title: string;
  };
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  uploadedBy: string;
  isSharedWithClient: boolean;
  needsSignature: boolean;
  isSigned: boolean;
  extractedText?: string;
  highlights?: DocumentHighlight[];
  annotations?: DocumentAnnotation[];
}
