export type InvoiceStatus = 'Draft' | 'Sent' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'BankTransfer' | 'Check' | 'CreditCard' | 'Online' | 'Other';
export type TrustTransactionType = 'Deposit' | 'Withdrawal';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  legalCaseId: string;
  legalCase?: {
    title: string;
    caseNumber: string;
    contact?: {
      fullName: string;
      phoneNumber: string;
    }
  };

  issueDate: string;
  dueDate: string;
  subTotal: number;
  taxTotal: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface TrustTransaction {
  id: string;
  legalCaseId: string;
  amount: number;
  type: TrustTransactionType;
  transactionDate: string;
  description: string;
  referenceNumber?: string;
}

export interface FinancialStats {
  totalRevenue: number;
  totalOutstanding: number;
  trustBalance: number;
  monthlyRevenue: number;
}

export interface CreateInvoiceRequest {
  invoiceNumber: string;
  legalCaseId: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface RecordTrustRequest {
  legalCaseId: string;
  amount: number;
  type: TrustTransactionType;
  transactionDate: string;
  description: string;
  referenceNumber?: string;
}

export interface UnbilledSummaryItem {
  caseId: string;
  caseTitle: string;
  caseNumber: string;
  clientName: string;
  unbilledExpenseCount: number;
  unbilledExpenseTotal: number;
}

