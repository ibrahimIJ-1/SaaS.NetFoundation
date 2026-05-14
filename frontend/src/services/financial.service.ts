import { apiClient } from './api-client';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  category: string;
  receiptUrl?: string;
  legalCaseId?: string;
  isBilled: boolean;
  invoiceId?: string;
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
    const response = await apiClient.post('/expenses', {
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      category: expense.category,
      receiptUrl: expense.receiptUrl,
      legalCaseId: expense.legalCaseId,
    });
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
