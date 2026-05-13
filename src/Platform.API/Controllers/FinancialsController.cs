using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/financials")]
    public class FinancialsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public FinancialsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalRevenue = await _dbContext.Payments.SumAsync(p => p.Amount);
            var totalOutstanding = await _dbContext.Invoices
                .Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled)
                .SumAsync(i => i.TotalAmount - i.PaidAmount);

            var trustBalance = await _dbContext.TrustTransactions
                .SumAsync(t => t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount);

            var monthlyRevenue = await _dbContext.Payments
                .Where(p => p.PaymentDate >= DateTime.UtcNow.AddMonths(-1))
                .SumAsync(p => p.Amount);

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOutstanding = totalOutstanding,
                TrustBalance = trustBalance,
                MonthlyRevenue = monthlyRevenue
            });
        }

        [HttpGet("trust/case/{caseId}")]
        public async Task<IActionResult> GetTrustTransactions(Guid caseId)
        {
            var transactions = await _dbContext.TrustTransactions
                .Where(t => t.LegalCaseId == caseId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            var balance = transactions.Sum(t => t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount);

            return Ok(new
            {
                Transactions = transactions,
                Balance = balance
            });
        }

        [HttpPost("trust")]
        public async Task<IActionResult> RecordTrustTransaction([FromBody] RecordTrustRequest request)
        {
            var transaction = new TrustTransaction
            {
                LegalCaseId = request.LegalCaseId,
                Amount = request.Amount,
                Type = request.Type,
                TransactionDate = request.TransactionDate,
                Description = request.Description,
                ReferenceNumber = request.ReferenceNumber
            };

            _dbContext.TrustTransactions.Add(transaction);
            await _dbContext.SaveChangesAsync();

            return Ok(transaction);
        }
    }

    public class RecordTrustRequest
    {
        public Guid LegalCaseId { get; set; }
        public decimal Amount { get; set; }
        public TrustTransactionType Type { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = default!;
        public string? ReferenceNumber { get; set; }
    }
}
