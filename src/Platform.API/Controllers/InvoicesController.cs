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
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InvoicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            return await _context.Invoices
                .Include(i => i.LegalCase)
                .OrderByDescending(i => i.IssueDate)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Invoice>> GetInvoice(Guid id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.LegalCase)
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return NotFound();
            return invoice;
        }

        [HttpPost("bulk-generate")]
        public async Task<ActionResult> BulkGenerate([FromBody] List<Guid> caseIds)
        {
            var cases = await _context.LegalCases
                .Where(c => caseIds.Contains(c.Id))
                .Include(c => c.Expenses.Where(e => !e.IsBilled))
                .ToListAsync();

            var generatedInvoices = new List<Invoice>();

            foreach (var legalCase in cases)
            {
                var unbilledExpenses = legalCase.Expenses.Where(e => !e.IsBilled).ToList();
                if (!unbilledExpenses.Any()) continue;

                var invoice = new Invoice
                {
                    LegalCaseId = legalCase.Id,

                    InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{legalCase.CaseNumber}",
                    IssueDate = DateTime.UtcNow,
                    DueDate = DateTime.UtcNow.AddDays(15),
                    Status = InvoiceStatus.Draft,
                    TotalAmount = unbilledExpenses.Sum(e => e.Amount),
                    PaidAmount = 0
                };


                foreach (var expense in unbilledExpenses)
                {
                    invoice.Items.Add(new InvoiceItem
                    {
                        Description = expense.Description,
                        UnitPrice = expense.Amount,
                        Quantity = 1,
                        Total = expense.Amount
                    });

                    expense.IsBilled = true;
                    expense.InvoiceId = invoice.Id;
                }

                _context.Invoices.Add(invoice);
                generatedInvoices.Add(invoice);
            }

            await _context.SaveChangesAsync();
            return Ok(new { count = generatedInvoices.Count });
        }

        [HttpGet("unbilled-summary")]
        public async Task<ActionResult> GetUnbilledSummary()
        {
            var summary = await _context.LegalCases
                .Include(c => c.Expenses)
                .Where(c => c.Expenses.Any(e => !e.IsBilled))
                .Select(c => new
                {
                    CaseId = c.Id,
                    CaseTitle = c.Title,
                    CaseNumber = c.CaseNumber,
                    UnbilledAmount = c.Expenses.Where(e => !e.IsBilled).Sum(e => e.Amount),
                    UnbilledCount = c.Expenses.Count(e => e.IsBilled == false)
                })
                .ToListAsync();

            return Ok(summary);
        }

        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var invoices = await _context.Invoices.ToListAsync();
            var trustBalance = await _context.TrustTransactions.SumAsync(t => t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount);


            return Ok(new
            {
                TotalInvoiced = invoices.Sum(i => i.TotalAmount),
                TotalCollected = invoices.Sum(i => i.PaidAmount),
                PendingAmount = invoices.Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled).Sum(i => i.TotalAmount - i.PaidAmount),
                TrustBalance = trustBalance
            });
        }
    }
}
