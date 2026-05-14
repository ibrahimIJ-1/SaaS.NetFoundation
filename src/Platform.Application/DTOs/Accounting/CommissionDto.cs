using System;

namespace Platform.Application.DTOs.Accounting
{
    public class CommissionRuleDto
    {
        public Guid Id { get; set; }
        public string LawyerId { get; set; } = default!;
        public string LawyerName { get; set; } = default!;
        public decimal Percentage { get; set; }
        public decimal FixedAmount { get; set; }
        public string? CaseTypeFilter { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCommissionRuleDto
    {
        public string LawyerId { get; set; } = default!;
        public string LawyerName { get; set; } = default!;
        public decimal Percentage { get; set; }
        public decimal FixedAmount { get; set; }
        public string? CaseTypeFilter { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class CommissionSummaryDto
    {
        public string LawyerId { get; set; } = default!;
        public string LawyerName { get; set; } = default!;
        public decimal TotalRevenue { get; set; }
        public decimal CommissionAmount { get; set; }
        public int CaseCount { get; set; }
    }
}
