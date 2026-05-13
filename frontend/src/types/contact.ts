export type ContactType = 'Individual' | 'Organization' | 'Government';
export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Letter' | 'Note' | 'Document';

export interface ContactInteraction {
  id: string;
  contactId: string;
  type: InteractionType;
  interactionDate: string;
  description: string;
  authorName?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  fullName: string;
  type: ContactType;
  email?: string;
  phoneNumber?: string;
  identificationNumber?: string;
  address?: string;
  companyName?: string;
  jobTitle?: string;
  isClient: boolean;
  notes?: string;
  tags: string[];
  cases?: any[]; // Link to LegalCase
  interactions?: ContactInteraction[];
  createdAt: string;
}

export interface ClientSummary {
  contactId: string;
  fullName: string;
  totalCases: number;
  activeCases: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  trustBalance: number;
}

export interface CreateContactRequest {
  fullName: string;
  type: ContactType;
  email?: string;
  phoneNumber?: string;
  identificationNumber?: string;
  address?: string;
  companyName?: string;
  jobTitle?: string;
  isClient: boolean;
  notes?: string;
  tags?: string[];
}

export interface CreateInteractionRequest {
  type: InteractionType;
  interactionDate: string;
  description: string;
  authorName?: string;
}
