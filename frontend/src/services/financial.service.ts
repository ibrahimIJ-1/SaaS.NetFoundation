import { apiClient } from './api-client';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  category: number; // Enum: 0=CourtFees, 1=Travel, 2=OfficeRent, etc.
  receiptUrl?: string;
  legalCaseId?: string;
}

export interface CommissionSummary {
  lawyerId: string;
  lawyerName: string;
  totalRevenue: number;
  commissionAmount: number;
  caseCount: number;
}

export const financialService = {
  getExpenses: async (): Promise<Expense[]> => {
    const response = await apiClient.get('/expenses');
    return response.data;
  },

  createExpense: async (expense: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.post('/expenses', expense);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  getCommissionSummary: async (lawyerId: string): Promise<CommissionSummary> => {
    const response = await apiClient.get(`/commissions/calculate/${lawyerId}`);
    return response.data;
  }
};
