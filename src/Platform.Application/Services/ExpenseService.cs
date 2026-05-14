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
    public class ExpenseService : IExpenseService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPostingService _postingService;

        public ExpenseService(ApplicationDbContext dbContext, IPostingService postingService)
        {
            _dbContext = dbContext;
            _postingService = postingService;
        }

        public async Task<List<ExpenseDto>> GetAllAsync()
        {
            return await _dbContext.Expenses
                .OrderByDescending(e => e.ExpenseDate)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Title = e.Description,
                    Description = e.Description,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Category = e.Category,
                    ReceiptUrl = e.ReceiptUrl,
                    LegalCaseId = e.LegalCaseId,
                    IsBilled = e.IsBilled,
                    InvoiceId = e.InvoiceId,
                    CurrencyId = e.CurrencyId,
                    ExchangeRate = e.ExchangeRate
                })
                .ToListAsync();
        }

        public async Task<List<ExpenseDto>> GetByCaseAsync(Guid caseId)
        {
            return await _dbContext.Expenses
                .Where(e => e.LegalCaseId == caseId)
                .OrderByDescending(e => e.ExpenseDate)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Title = e.Description,
                    Description = e.Description,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Category = e.Category,
                    ReceiptUrl = e.ReceiptUrl,
                    LegalCaseId = e.LegalCaseId,
                    IsBilled = e.IsBilled,
                    InvoiceId = e.InvoiceId,
                    CurrencyId = e.CurrencyId,
                    ExchangeRate = e.ExchangeRate
                })
                .ToListAsync();
        }

        public async Task<ExpenseDto> CreateAsync(CreateExpenseRequestDto request)
        {
            decimal exchangeRate = 1.0m;
            Guid? currencyId = request.CurrencyId;

            if (currencyId.HasValue)
            {
                var currency = await _dbContext.Currencies.FindAsync(currencyId.Value);
                if (currency != null) exchangeRate = currency.ExchangeRate;
            }
            else
            {
                var baseCurrency = await _dbContext.Currencies.FirstOrDefaultAsync(c => c.IsBase);
                if (baseCurrency != null)
                {
                    currencyId = baseCurrency.Id;
                    exchangeRate = baseCurrency.ExchangeRate;
                }
            }

            var expense = new Expense
            {
                LegalCaseId = request.LegalCaseId.GetValueOrDefault(),
                Description = request.Title,
                Amount = request.Amount,
                ExpenseDate = request.ExpenseDate,
                Category = request.Category,
                ReceiptUrl = request.ReceiptUrl,
                CurrencyId = currencyId,
                ExchangeRate = exchangeRate,
                CreatedBy = ""
            };

            _dbContext.Expenses.Add(expense);
            await _dbContext.SaveChangesAsync();

            // Post journal entry for expense
            await _postingService.PostExpenseRecordedAsync(expense.Id);

            return new ExpenseDto
            {
                Id = expense.Id,
                Title = expense.Description,
                Description = expense.Description,
                Amount = expense.Amount,
                ExpenseDate = expense.ExpenseDate,
                Category = expense.Category,
                ReceiptUrl = expense.ReceiptUrl,
                LegalCaseId = expense.LegalCaseId,
                IsBilled = expense.IsBilled,
                InvoiceId = expense.InvoiceId,
                CurrencyId = expense.CurrencyId,
                ExchangeRate = expense.ExchangeRate
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var expense = await _dbContext.Expenses.FindAsync(id)
                ?? throw new InvalidOperationException("Expense not found.");

            _dbContext.Expenses.Remove(expense);
            await _dbContext.SaveChangesAsync();
        }
    }
}
