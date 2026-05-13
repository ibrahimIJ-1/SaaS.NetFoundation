import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: reportService.getDashboardSummary,
    refetchInterval: 60000,
  });
}

export function useRevenueByMonth() {
  return useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: reportService.getRevenueByMonth,
  });
}

export function useCaseStats() {
  return useQuery({
    queryKey: ['reports', 'cases'],
    queryFn: reportService.getCaseStats,
  });
}

export function useLawyerWorkload() {
  return useQuery({
    queryKey: ['reports', 'workload'],
    queryFn: reportService.getLawyerWorkload,
  });
}

export function useFinancialProjections() {
  return useQuery({
    queryKey: ['reports', 'projections'],
    queryFn: reportService.getFinancialProjections,
  });
}

