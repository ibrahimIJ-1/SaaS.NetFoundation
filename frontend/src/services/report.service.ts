import { apiClient } from "./api-client";

export interface DashboardSummary {
  totalCases: number;
  activeCases: number;
  monthlyRevenue: number;
  revenueTrend: string;
  casesTrend: string;
  upcomingSessions: any[];
  recentActivities: any[];
}

export const reportService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get("/reports/dashboard-summary");
    return response.data;
  },
  getRevenueByMonth: async () => {
    const response = await apiClient.get("/reports/revenue-by-month");
    return response.data;
  },
  getCaseStats: async () => {
    const response = await apiClient.get("/reports/case-stats");
    return response.data;
  },
  getLawyerWorkload: async () => {
    const response = await apiClient.get("/reports/lawyer-workload");
    return response.data;
  },
  getFinancialProjections: async () => {
    const response = await apiClient.get("/reports/projections");
    return response.data;
  },
};
