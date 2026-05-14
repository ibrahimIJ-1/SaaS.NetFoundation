using Platform.Application.DTOs.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface IFinancialReportService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<List<RevenueByMonthDto>> GetRevenueByMonthAsync();
        Task<DashboardSummaryDto> GetDashboardSummaryAsync();
        Task<FinancialProjectionDto> GetFinancialProjectionsAsync();
    }
}
