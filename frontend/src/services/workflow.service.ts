import { apiClient } from './api-client';
import {
  WorkflowDefinition,
  CreateWorkflowRequest,
  LegalTransaction,
  TransactionListItem,
  TransactionStats,
  CreateTransactionRequest,
  UpdateStepRequest,
} from '@/types/workflow';

// ── Workflow Template APIs ───────────────────────────────────────────────────

export const workflowService = {
  // Workflow Definitions
  getAll: async (): Promise<WorkflowDefinition[]> => {
    const res = await apiClient.get('/workflows');
    return res.data;
  },

  getById: async (id: string): Promise<WorkflowDefinition> => {
    const res = await apiClient.get(`/workflows/${id}`);
    return res.data;
  },

  create: async (data: CreateWorkflowRequest): Promise<WorkflowDefinition> => {
    const res = await apiClient.post('/workflows', data);
    return res.data;
  },

  update: async (id: string, data: CreateWorkflowRequest): Promise<WorkflowDefinition> => {
    const res = await apiClient.put(`/workflows/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workflows/${id}`);
  },

  // Transactions
  getAllTransactions: async (params?: {
    status?: string;
    contactId?: string;
  }): Promise<TransactionListItem[]> => {
    const res = await apiClient.get('/transactions', { params });
    return res.data;
  },

  getTransactionById: async (id: string): Promise<LegalTransaction> => {
    const res = await apiClient.get(`/transactions/${id}`);
    return res.data;
  },

  createTransaction: async (data: CreateTransactionRequest): Promise<{ id: string; transactionNumber: string }> => {
    const res = await apiClient.post('/transactions', data);
    return res.data;
  },

  updateStep: async (transactionId: string, stepId: string, data: UpdateStepRequest): Promise<void> => {
    await apiClient.patch(`/transactions/${transactionId}/steps/${stepId}`, data);
  },

  uploadFile: async (transactionId: string, stepId: string, file: File): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/transactions/${transactionId}/steps/${stepId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteFile: async (transactionId: string, stepId: string, fileName: string): Promise<void> => {
    await apiClient.delete(`/transactions/${transactionId}/steps/${stepId}/files?fileName=${encodeURIComponent(fileName)}`);
  },

  cancelTransaction: async (id: string): Promise<void> => {
    await apiClient.patch(`/transactions/${id}/cancel`);
  },

  getStats: async (): Promise<TransactionStats> => {
    const res = await apiClient.get('/transactions/stats');
    return res.data;
  },
};
