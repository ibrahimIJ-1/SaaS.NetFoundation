using Platform.Application.DTOs.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface ICommissionService
    {
        Task<List<CommissionRuleDto>> GetRulesAsync();
        Task<CommissionRuleDto> CreateRuleAsync(CreateCommissionRuleDto request);
        Task<CommissionSummaryDto> CalculateAsync(string lawyerId);
    }
}
