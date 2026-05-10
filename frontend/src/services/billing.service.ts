import { apiClient } from "./api-client";
import {
  Invoice,
  RecordPaymentDto,
  BillingSummary,
  InvoiceListItem,
  CreateInvoiceDto,
} from "@/types/billing";

export const billingService = {
  getBillingSummary: () =>
    apiClient
      .get<BillingSummary>("/tenant/billing/summary")
      .then((res) => res.data),

  getInvoices: (params?: any) =>
    apiClient
      .get<InvoiceListItem[]>("/tenant/billing/invoices", { params })
      .then((res) => res.data),

  createInvoice: (data: CreateInvoiceDto) =>
    apiClient
      .post<string>("/tenant/billing/invoices", data)
      .then((res) => res.data),

  getPatientLedger: (patientId: string) =>
    apiClient
      .get<Invoice[]>(`/tenant/billing/patient/${patientId}/ledger`)
      .then((res) => res.data),

  recordPayment: (data: RecordPaymentDto) =>
    apiClient.post("/tenant/billing/payments", data).then((res) => res.data),

  generateFromTreatmentPlan: (patientId: string, itemIds: string[]) =>
    apiClient.post<string>("/tenant/billing/generate-from-treatment-plan", { patientId, treatmentPlanItemIds: itemIds }).then(res => res.data),

  getInsurancePolicies: (patientId: string) =>
    apiClient.get<any[]>(`/tenant/billing/insurance/policies/${patientId}`).then(res => res.data),
};
