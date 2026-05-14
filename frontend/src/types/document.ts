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
  createdAt?: string;
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

export interface DocumentVideoAnnotation {
  id: string;
  documentId: string;
  timeStart: number;
  timeEnd: number;
  comment: string;
  color: string;
  label?: string;
  createdAt?: string;
}

export interface CaseDocument {
  id: string;
  legalCaseId: string;
  legalCase?: {
    title: string;
  };
  fileName: string;
  fileUrl: string;
  contentType: string;
  convertedPdfUrl?: string;
  uploadDate: string;
  uploadedBy: string;
  isSharedWithClient: boolean;
  needsSignature: boolean;
  isSigned: boolean;
  version?: number;
  parentDocumentId?: string;
  extractedText?: string;
  ocrStatus?: string;
  highlights?: DocumentHighlight[];
  annotations?: DocumentAnnotation[];
  videoAnnotations?: DocumentVideoAnnotation[];
}
