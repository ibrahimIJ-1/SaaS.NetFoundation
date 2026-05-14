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
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPostingService _postingService;

        public InvoiceService(ApplicationDbContext context, IPostingService postingService)
        {
            _context = context;
            _postingService = postingService;
        }

        public async Task<List<InvoiceListDto>> GetAllAsync()
        {
            var invoices = await _context.Invoices
                .OrderByDescending(i => i.IssueDate)
                .ToListAsync();

            var caseIds = invoices.Select(i => i.LegalCaseId).Distinct().ToList();
            var cases = await _context.LegalCases.Where(c => caseIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);
            var currencyIds = invoices.Where(i => i.CurrencyId.HasValue).Select(i => i.CurrencyId!.Value).Distinct().ToList();
            var currencies = await _context.Currencies.Where(c => currencyIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);

            return invoices.Select(i => new InvoiceListDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                LegalCaseId = i.LegalCaseId,
                CaseTitle = cases.TryGetValue(i.LegalCaseId, out var c) ? c.Title : null,
                CaseNumber = cases.TryGetValue(i.LegalCaseId, out var cn) ? cn.CaseNumber : null,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                TotalAmount = i.TotalAmount,
                PaidAmount = i.PaidAmount,
                Status = i.Status.ToString(),
                CurrencyId = i.CurrencyId,
                ExchangeRate = i.ExchangeRate
            }).ToList();
        }

        public async Task<InvoiceDto?> GetByIdAsync(Guid id)
        {
            var invoice = await _context.Invoices
                .Where(i => i.Id == id)
                .FirstOrDefaultAsync();

            if (invoice == null) return null;

            var legalCase = await _context.LegalCases.FindAsync(invoice.LegalCaseId);

            Currency? currency = null;
            if (invoice.CurrencyId.HasValue)
                currency = await _context.Currencies.FindAsync(invoice.CurrencyId.Value);

            var items = await _context.Set<InvoiceItem>().Where(item => item.InvoiceId == id).ToListAsync();

            return new InvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                LegalCaseId = invoice.LegalCaseId,
                CaseTitle = legalCase?.Title,
                CaseNumber = legalCase?.CaseNumber,
                ClientName = legalCase?.ClientName,
                IssueDate = invoice.IssueDate,
                DueDate = invoice.DueDate,
                SubTotal = invoice.SubTotal,
                TaxTotal = invoice.TaxTotal,
                TotalAmount = invoice.TotalAmount,
                PaidAmount = invoice.PaidAmount,
                Status = invoice.Status.ToString(),
                Notes = invoice.Notes,
                CurrencyId = invoice.CurrencyId,
                CurrencyCode = currency?.Code,
                ExchangeRate = invoice.ExchangeRate,
                CreatedOn = invoice.CreatedOn,
                Items = items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TaxRate = item.TaxRate,
                    Total = item.Total
                }).ToList()
            };
        }

        public async Task<List<InvoiceListDto>> GetByCaseAsync(Guid caseId)
        {
            var invoices = await _context.Invoices
                .Where(i => i.LegalCaseId == caseId)
                .OrderByDescending(i => i.IssueDate)
                .ToListAsync();

            var currencyIds = invoices.Where(i => i.CurrencyId.HasValue).Select(i => i.CurrencyId!.Value).Distinct().ToList();
            var currencies = await _context.Currencies.Where(c => currencyIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);

            return invoices.Select(i => new InvoiceListDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                LegalCaseId = i.LegalCaseId,
                CaseTitle = null,
                CaseNumber = null,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                TotalAmount = i.TotalAmount,
                PaidAmount = i.PaidAmount,
                Status = i.Status.ToString(),
                CurrencyId = i.CurrencyId,
                ExchangeRate = i.ExchangeRate
            }).ToList();
        }

        public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequestDto request)
        {
            var legalCase = await _context.LegalCases.FindAsync(request.LegalCaseId)
                ?? throw new InvalidOperationException("Case not found.");

            decimal exchangeRate = 1.0m;
            if (request.CurrencyId.HasValue)
            {
                var currency = await _context.Currencies.FindAsync(request.CurrencyId.Value);
                if (currency != null) exchangeRate = currency.ExchangeRate;
            }
            else
            {
                var baseCurrency = await _context.Currencies.FirstOrDefaultAsync(c => c.IsBase);
                if (baseCurrency != null)
                {
                    request.CurrencyId = baseCurrency.Id;
                    exchangeRate = baseCurrency.ExchangeRate;
                }
            }

            var subtotal = request.Items.Sum(item => item.Quantity * item.UnitPrice);
            var taxTotal = request.Items.Sum(item => item.Quantity * item.UnitPrice * item.TaxRate / 100m);
            var total = subtotal + taxTotal;

            var invoice = new Invoice
            {
                InvoiceNumber = request.InvoiceNumber,
                LegalCaseId = request.LegalCaseId,
                IssueDate = request.IssueDate,
                DueDate = request.DueDate,
                SubTotal = subtotal,
                TaxTotal = taxTotal,
                TotalAmount = total,
                PaidAmount = 0,
                Status = InvoiceStatus.Draft,
                Notes = request.Notes,
                CurrencyId = request.CurrencyId,
                ExchangeRate = exchangeRate
            };

            foreach (var item in request.Items)
            {
                var itemTotal = item.Quantity * item.UnitPrice * (1 + item.TaxRate / 100m);
                invoice.Items.Add(new InvoiceItem
                {
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TaxRate = item.TaxRate,
                    Total = itemTotal
                });
            }

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(invoice.Id))!;
        }

        public async Task<InvoiceDto> UpdateStatusAsync(Guid id, UpdateInvoiceStatusDto request)
        {
            var invoice = await _context.Invoices.FindAsync(id)
                ?? throw new InvalidOperationException("Invoice not found.");

            if (!Enum.TryParse<InvoiceStatus>(request.Status, out var newStatus))
                throw new InvalidOperationException($"Invalid status: {request.Status}");

            var oldStatus = invoice.Status;

            // Status transition validation
            if (oldStatus == InvoiceStatus.Paid && newStatus != InvoiceStatus.Cancelled)
                throw new InvalidOperationException("Cannot change status of a paid invoice.");
            if (oldStatus == InvoiceStatus.Cancelled)
                throw new InvalidOperationException("Cannot change status of a cancelled invoice.");
            if (oldStatus == InvoiceStatus.Draft && newStatus == InvoiceStatus.Paid)
                throw new InvalidOperationException("Cannot mark a draft invoice as paid. Send it first.");

            invoice.Status = newStatus;
            await _context.SaveChangesAsync();

            // Post journal entry for status changes
            if ((oldStatus == InvoiceStatus.Draft && newStatus == InvoiceStatus.Sent) ||
                (oldStatus == InvoiceStatus.Draft && newStatus == InvoiceStatus.Partial))
            {
                await _postingService.PostInvoiceCreatedAsync(invoice.Id);
            }
            else if (newStatus == InvoiceStatus.Cancelled && oldStatus != InvoiceStatus.Draft)
            {
                await _postingService.PostInvoiceCancelledAsync(invoice.Id);
            }

            return (await GetByIdAsync(id))!;
        }

        public async Task<BulkGenerateResultDto> BulkGenerateAsync(BulkGenerateRequestDto request)
        {
            var baseCurrency = await _context.Currencies.FirstOrDefaultAsync(c => c.IsBase);

            var cases = await _context.LegalCases
                .Where(c => request.CaseIds.Contains(c.Id))
                .Include(c => c.Expenses.Where(e => !e.IsBilled))
                .ToListAsync();

            var generatedCount = 0;

            foreach (var legalCase in cases)
            {
                var unbilledExpenses = legalCase.Expenses.Where(e => !e.IsBilled).ToList();
                if (unbilledExpenses.Count == 0) continue;

                Guid? resolvedCurrencyId = request.CurrencyId;
                if (resolvedCurrencyId == null)
                {
                    var firstWithCurrency = unbilledExpenses.FirstOrDefault(e => e.CurrencyId.HasValue);
                    resolvedCurrencyId = firstWithCurrency?.CurrencyId ?? baseCurrency?.Id;
                }

                decimal exchangeRate = 1.0m;
                if (resolvedCurrencyId.HasValue)
                {
                    var currency = await _context.Currencies.FindAsync(resolvedCurrencyId.Value);
                    if (currency != null) exchangeRate = currency.ExchangeRate;
                }

                var totalAmount = unbilledExpenses.Sum(e => e.Amount);

                var invoice = new Invoice
                {
                    LegalCaseId = legalCase.Id,
                    InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{legalCase.CaseNumber}",
                    IssueDate = DateTime.UtcNow,
                    DueDate = DateTime.UtcNow.AddDays(15),
                    SubTotal = totalAmount,
                    TaxTotal = 0,
                    TotalAmount = totalAmount,
                    PaidAmount = 0,
                    Status = InvoiceStatus.Draft,
                    CurrencyId = resolvedCurrencyId,
                    ExchangeRate = exchangeRate
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
                generatedCount++;
            }

            await _context.SaveChangesAsync();
            return new BulkGenerateResultDto { Count = generatedCount };
        }

        public async Task<InvoiceStatsDto> GetStatsAsync()
        {
            var invoices = await _context.Invoices.ToListAsync();
            var trustTransactions = await _context.TrustTransactions.ToListAsync();

            var totalInvoicedBase = invoices.Sum(i => i.TotalAmount * i.ExchangeRate);
            var totalCollectedBase = invoices.Sum(i => i.PaidAmount * i.ExchangeRate);
            var pendingAmountBase = invoices
                .Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled)
                .Sum(i => (i.TotalAmount - i.PaidAmount) * i.ExchangeRate);
            var trustBalanceBase = trustTransactions
                .Sum(t => (t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount) * t.ExchangeRate);

            return new InvoiceStatsDto
            {
                TotalInvoiced = totalInvoicedBase,
                TotalCollected = totalCollectedBase,
                PendingAmount = pendingAmountBase,
                TrustBalance = trustBalanceBase
            };
        }

        public async Task<List<UnbilledSummaryDto>> GetUnbilledSummaryAsync()
        {
            return await _context.LegalCases
                .Include(c => c.Expenses)
                .Where(c => c.Expenses.Any(e => !e.IsBilled))
                .Select(c => new UnbilledSummaryDto
                {
                    CaseId = c.Id,
                    CaseTitle = c.Title,
                    CaseNumber = c.CaseNumber,
                    UnbilledAmount = c.Expenses.Where(e => !e.IsBilled).Sum(e => e.Amount),
                    UnbilledCount = c.Expenses.Count(e => !e.IsBilled)
                })
                .ToListAsync();
        }
    }
}
