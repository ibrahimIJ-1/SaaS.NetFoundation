using Microsoft.EntityFrameworkCore;
using Platform.Application.DTOs.Accounting;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public class CommissionService : ICommissionService
    {
        private readonly ApplicationDbContext _dbContext;

        public CommissionService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<CommissionRuleDto>> GetRulesAsync()
        {
            return await _dbContext.CommissionRules
                .Select(r => new CommissionRuleDto
                {
                    Id = r.Id,
                    LawyerId = r.LawyerId,
                    LawyerName = r.LawyerName,
                    Percentage = r.Percentage,
                    FixedAmount = r.FixedAmount,
                    CaseTypeFilter = r.CaseTypeFilter,
                    IsActive = r.IsActive
                })
                .ToListAsync();
        }

        public async Task<CommissionRuleDto> CreateRuleAsync(CreateCommissionRuleDto request)
        {
            var rule = new CommissionRule
            {
                LawyerId = request.LawyerId,
                LawyerName = request.LawyerName,
                Percentage = request.Percentage,
                FixedAmount = request.FixedAmount,
                CaseTypeFilter = request.CaseTypeFilter,
                IsActive = request.IsActive
            };

            _dbContext.CommissionRules.Add(rule);
            await _dbContext.SaveChangesAsync();

            return new CommissionRuleDto
            {
                Id = rule.Id,
                LawyerId = rule.LawyerId,
                LawyerName = rule.LawyerName,
                Percentage = rule.Percentage,
                FixedAmount = rule.FixedAmount,
                CaseTypeFilter = rule.CaseTypeFilter,
                IsActive = rule.IsActive
            };
        }

        public async Task<CommissionSummaryDto> CalculateAsync(string lawyerId)
        {
            var rule = await _dbContext.CommissionRules
                .FirstOrDefaultAsync(r => r.LawyerId == lawyerId && r.IsActive)
                ?? throw new InvalidOperationException("No active commission rule found for this lawyer.");

            var paidInvoices = await _dbContext.Invoices
                .Include(i => i.LegalCase)
                .Where(i => i.LegalCase.AssignedLawyerId == lawyerId && i.PaidAmount > 0)
                .ToListAsync();

            var totalRevenue = paidInvoices.Sum(i => i.PaidAmount);
            var commissionAmount = (totalRevenue * rule.Percentage / 100) + (paidInvoices.Count * rule.FixedAmount);

            return new CommissionSummaryDto
            {
                LawyerId = lawyerId,
                LawyerName = rule.LawyerName,
                TotalRevenue = totalRevenue,
                CommissionAmount = commissionAmount,
                CaseCount = paidInvoices.Count
            };
        }
    }
}
