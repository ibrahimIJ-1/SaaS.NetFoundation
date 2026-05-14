import { apiClient } from './api-client';
import { Invoice, InvoiceItem, Payment, FinancialStats, UnbilledSummaryItem } from '@/types/billing';

export const billingService = {
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get('/invoices');
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: any): Promise<Invoice> => {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  getInvoicesByCase: async (caseId: string): Promise<Invoice[]> => {
    const response = await apiClient.get(`/invoices/case/${caseId}`);
    return response.data;
  },

  getFinancialStats: async (): Promise<FinancialStats> => {
    const response = await apiClient.get('/invoices/stats');
    return response.data;
  },

  getRecentPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/invoices/payments/recent');
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: string): Promise<Invoice> => {
    const response = await apiClient.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  // Bulk Billing
  getUnbilledSummary: async (): Promise<UnbilledSummaryItem[]> => {
    const response = await apiClient.get('/invoices/unbilled-summary');
    return response.data;
  },

  bulkGenerateInvoices: async (caseIds: string[]): Promise<any> => {
    const response = await apiClient.post('/invoices/bulk-generate', { caseIds });
    return response.data;
  },

  // Expenses
  getExpenses: async (caseId?: string): Promise<any[]> => {
    const response = await apiClient.get('/financial/expenses', {
      params: { caseId }
    });
    return response.data;
  },

  createExpense: async (data: any): Promise<any> => {
    const response = await apiClient.post('/financial/expenses', data);
    return response.data;
  },

  // Payments & Trust
  recordPayment: async (id: string, data: any): Promise<Payment> => {
    const response = await apiClient.post(`/invoices/${id}/payments`, data);
    return response.data;
  },

  getTrustTransactions: async (caseId: string): Promise<{ balance: number, transactions: any[] }> => {
    const response = await apiClient.get(`/financial/trust/${caseId}`);
    return response.data;
  },

  recordTrust: async (caseId: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/financial/trust/${caseId}`, data);
    return response.data;
  }
};

