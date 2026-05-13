using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/commissions")]
    public class CommissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public CommissionsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("rules")]
        public async Task<IActionResult> GetRules()
        {
            var rules = await _dbContext.CommissionRules.ToListAsync();
            return Ok(rules);
        }

        [HttpPost("rules")]
        public async Task<IActionResult> CreateRule([FromBody] CommissionRule rule)
        {
            _dbContext.CommissionRules.Add(rule);
            await _dbContext.SaveChangesAsync();
            return Ok(rule);
        }

        [HttpGet("calculate/{lawyerId}")]
        public async Task<IActionResult> CalculateCommission(string lawyerId)
        {
            var rule = await _dbContext.CommissionRules
                .FirstOrDefaultAsync(r => r.LawyerId == lawyerId && r.IsActive);

            if (rule == null) return NotFound("No active commission rule found for this lawyer.");

            // Get all paid invoices for cases assigned to this lawyer
            var paidInvoices = await _dbContext.Invoices
                .Include(i => i.LegalCase)
                .Where(i => i.LegalCase.AssignedLawyerId == lawyerId && i.PaidAmount > 0)
                .ToListAsync();

            var totalRevenue = paidInvoices.Sum(i => i.PaidAmount);
            var commissionAmount = (totalRevenue * rule.Percentage / 100) + (paidInvoices.Count * rule.FixedAmount);

            return Ok(new
            {
                LawyerId = lawyerId,
                LawyerName = rule.LawyerName,
                TotalRevenue = totalRevenue,
                CommissionAmount = commissionAmount,
                CaseCount = paidInvoices.Count
            });
        }
    }
}
