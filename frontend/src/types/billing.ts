export type InvoiceStatus = 'Draft' | 'Unpaid' | 'PartiallyPaid' | 'Paid' | 'Void';
export type PaymentMethod = 'Cash' | 'Card' | 'Insurance' | 'BankTransfer';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  transactionId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface RecordPaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface BillingSummary {
  totalOutstanding: number;
  totalRevenue: number;
  totalCollected: number;
  revenueThisMonth: number;
  collectedThisMonth: number;
  recentInvoices: InvoiceListItem[];
}

export interface InvoiceListItem {
  id: string;
  patientId: string;
  invoiceNumber: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
}

export interface CreateInvoiceDto {
  patientId: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  dueDate?: string;
}

export type ClaimStatus = 'Pending' | 'Submitted' | 'Approved' | 'PartiallyApproved' | 'Rejected' | 'Paid';

export interface InsuranceProvider {
  id: string;
  name: string;
  code?: string;
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  policyNumber: string;
  coveragePercentage: number;
  yearlyLimit: number;
  usedLimit: number;
  isActive: boolean;
}

export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  policyId: string;
  claimNumber: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  submissionDate: string;
}
