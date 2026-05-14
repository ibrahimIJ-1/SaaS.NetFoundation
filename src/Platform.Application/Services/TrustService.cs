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
    public class TrustService : ITrustService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPostingService _postingService;

        public TrustService(ApplicationDbContext dbContext, IPostingService postingService)
        {
            _dbContext = dbContext;
            _postingService = postingService;
        }

        public async Task<TrustTransactionsResponseDto> GetByCaseAsync(Guid caseId)
        {
            var transactions = await _dbContext.TrustTransactions
                .Where(t => t.LegalCaseId == caseId)
                .Include(t => t.Currency)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new TrustTransactionDto
                {
                    Id = t.Id,
                    LegalCaseId = t.LegalCaseId,
                    Amount = t.Amount,
                    Type = t.Type.ToString(),
                    TransactionDate = t.TransactionDate,
                    Description = t.Description,
                    ReferenceNumber = t.ReferenceNumber,
                    CurrencyId = t.CurrencyId,
                    CurrencyCode = t.Currency != null ? t.Currency.Code : null,
                    ExchangeRate = t.ExchangeRate
                })
                .ToListAsync();

            var balance = transactions.Sum(t =>
            {
                var signedAmount = t.Type == "Deposit" ? t.Amount : -t.Amount;
                return signedAmount * t.ExchangeRate;
            });

            return new TrustTransactionsResponseDto
            {
                Transactions = transactions,
                Balance = balance
            };
        }

        public async Task<List<TrustTransactionDto>> GetAllAsync()
        {
            return await _dbContext.TrustTransactions
                .Include(t => t.Currency)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new TrustTransactionDto
                {
                    Id = t.Id,
                    LegalCaseId = t.LegalCaseId,
                    Amount = t.Amount,
                    Type = t.Type.ToString(),
                    TransactionDate = t.TransactionDate,
                    Description = t.Description,
                    ReferenceNumber = t.ReferenceNumber,
                    CurrencyId = t.CurrencyId,
                    CurrencyCode = t.Currency != null ? t.Currency.Code : null,
                    ExchangeRate = t.ExchangeRate
                })
                .ToListAsync();
        }

        public async Task<TrustTransactionDto> RecordTransactionAsync(RecordTrustRequestDto request)
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

            var transaction = new TrustTransaction
            {
                LegalCaseId = request.LegalCaseId,
                Amount = request.Amount,
                Type = Enum.Parse<TrustTransactionType>(request.Type),
                TransactionDate = request.TransactionDate,
                Description = request.Description,
                ReferenceNumber = request.ReferenceNumber,
                CurrencyId = currencyId,
                ExchangeRate = exchangeRate
            };

            _dbContext.TrustTransactions.Add(transaction);
            await _dbContext.SaveChangesAsync();

            // Post journal entry for trust transaction
            await _postingService.PostTrustTransactionAsync(transaction.Id);

            return new TrustTransactionDto
            {
                Id = transaction.Id,
                LegalCaseId = transaction.LegalCaseId,
                Amount = transaction.Amount,
                Type = transaction.Type.ToString(),
                TransactionDate = transaction.TransactionDate,
                Description = transaction.Description,
                ReferenceNumber = transaction.ReferenceNumber,
                CurrencyId = transaction.CurrencyId,
                ExchangeRate = transaction.ExchangeRate
            };
        }
    }
}
