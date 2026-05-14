using System;
using System.Collections.Generic;

namespace Platform.Application.DTOs.Accounting
{
    public class RevenueByMonthDto
    {
        public string Month { get; set; } = default!;
        public decimal Amount { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int TotalCases { get; set; }
        public int ActiveCases { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public string RevenueTrend { get; set; } = default!;
        public string CasesTrend { get; set; } = default!;
    }

    public class FinancialProjectionDto
    {
        public decimal CurrentReceivables { get; set; }
        public decimal TotalTrustFunds { get; set; }
        public decimal ProjectedCollections30Days { get; set; }
        public decimal TotalLiquidity { get; set; }
    }

    public class DashboardStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalOutstanding { get; set; }
        public decimal TrustBalance { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }
}
