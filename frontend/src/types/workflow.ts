export type TransactionStatus = 'Active' | 'Completed' | 'Cancelled';
export type StepStatus = 'Pending' | 'InProgress' | 'Completed';

// ── Workflow Templates ──────────────────────────────────────────────────────

export interface WorkflowStepDefinition {
  id: string;
  workflowDefinitionId: string;
  name: string;
  description?: string;
  estimatedPrice: number;
  estimatedExpense: number;
  order: number;
  requiredFileNames: string[];
  defaultAssigneeContactIds: string[];
  createdOn: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  totalEstimatedPrice: number;
  totalEstimatedExpenses: number;
  currencyId?: string;
  steps: WorkflowStepDefinition[];
  createdOn: string;
}

export interface CreateWorkflowStepRequest {
  name: string;
  description?: string;
  estimatedPrice: number;
  estimatedExpense: number;
  currencyId?: string;
  requiredFileNames: string[];
  defaultAssigneeContactIds: string[];
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  totalEstimatedPrice: number;
  totalEstimatedExpenses: number;
  currencyId?: string;
  steps: CreateWorkflowStepRequest[];
}

// ── Transactions ────────────────────────────────────────────────────────────

export interface TransactionStep {
  id: string;
  stepName: string;
  order: number;
  status: StepStatus;
  actualPrice: number;
  actualExpense: number;
  expenseDescription?: string;
  notes?: string;
  completionDate?: string;
  assignedPersonsJson: string;
  uploadedFilesJson?: string;
  currencyId?: string;
  exchangeRate: number;
  estimatedPrice: number;
  estimatedExpense: number;
  requiredFileNames: string[];
}

export interface LegalTransaction {
  id: string;
  transactionNumber: string;
  status: TransactionStatus;
  actualPrice: number;
  notes?: string;
  currencyId?: string;
  exchangeRate: number;
  createdOn: string;
  clientName: string;
  workflowDefinitionId: string;
  workflowName: string;
  contactId?: string;
  contactName: string;
  totalActualExpenses: number;
  estimatedPrice: number;
  estimatedExpenses: number;
  steps: TransactionStep[];
}

export interface TransactionListItem {
  id: string;
  transactionNumber: string;
  status: TransactionStatus;
  actualPrice: number;
  currencyId?: string;
  exchangeRate: number;
  createdOn: string;
  clientName: string;
  workflowName: string;
  contactName: string;
  totalSteps: number;
  completedSteps: number;
  totalActualExpenses: number;
  currentStepName?: string;
}

export interface TransactionStats {
  active: number;
  completed: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface CreateTransactionRequest {
  workflowDefinitionId: string;
  contactId?: string;
  clientName?: string;
  actualPrice: number;
  notes?: string;
  currencyId?: string;
}

export interface UpdateStepRequest {
  status?: StepStatus;
  actualPrice?: number;
  actualExpense?: number;
  expenseDescription?: string;
  notes?: string;
  currencyId?: string;
}
