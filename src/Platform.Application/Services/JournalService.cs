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
    public class JournalService : IJournalService
    {
        private readonly ApplicationDbContext _db;

        public JournalService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<JournalEntryDto>> GetEntriesAsync(DateTime? from, DateTime? to, string? referenceType, Guid? referenceId)
        {
            var query = _db.Set<JournalEntry>()
                .Include(e => e.Lines)
                .ThenInclude(l => l.Account)
                .AsQueryable();

            if (from.HasValue) query = query.Where(e => e.EntryDate >= from.Value);
            if (to.HasValue) query = query.Where(e => e.EntryDate <= to.Value);
            if (!string.IsNullOrEmpty(referenceType)) query = query.Where(e => e.ReferenceType == referenceType);
            if (referenceId.HasValue) query = query.Where(e => e.ReferenceId == referenceId.Value);

            return await query
                .OrderByDescending(e => e.EntryDate)
                .Select(e => new JournalEntryDto
                {
                    Id = e.Id,
                    EntryNumber = e.EntryNumber,
                    EntryDate = e.EntryDate,
                    Description = e.Description,
                    Type = e.Type.ToString(),
                    ReferenceId = e.ReferenceId,
                    ReferenceType = e.ReferenceType,
                    IsPosted = e.IsPosted,
                    Lines = e.Lines.Select(l => new JournalEntryLineDto
                    {
                        Id = l.Id,
                        AccountId = l.AccountId,
                        AccountCode = l.Account.AccountCode,
                        AccountName = l.Account.AccountName,
                        Debit = l.Debit,
                        Credit = l.Credit,
                        Description = l.Description,
                        ExchangeRate = l.ExchangeRate
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<TrialBalanceDto>> GetTrialBalanceAsync(DateTime? asOf)
        {
            var query = _db.Set<JournalEntryLine>()
                .Include(l => l.Account)
                .Include(l => l.JournalEntry)
                .AsQueryable();

            if (asOf.HasValue)
            {
                query = query.Where(l => l.JournalEntry.EntryDate <= asOf.Value);
            }

            var result = await query
                .GroupBy(l => new { l.AccountId, l.Account.AccountCode, l.Account.AccountName, l.Account.Type })
                .Select(g => new TrialBalanceDto
                {
                    AccountCode = g.Key.AccountCode,
                    AccountName = g.Key.AccountName,
                    AccountType = g.Key.Type.ToString(),
                    TotalDebit = g.Sum(l => l.Debit),
                    TotalCredit = g.Sum(l => l.Credit),
                    Balance = g.Sum(l => l.Debit) - g.Sum(l => l.Credit)
                })
                .OrderBy(t => t.AccountCode)
                .ToListAsync();

            return result;
        }

        public async Task<BalanceSheetDto> GetBalanceSheetAsync(DateTime? asOf)
        {
            var trialBalance = await GetTrialBalanceAsync(asOf);

            var result = new BalanceSheetDto();

            foreach (var item in trialBalance)
            {
                var type = Enum.Parse<AccountType>(item.AccountType);
                var amount = Math.Abs(item.Balance);

                var section = new BalanceSheetSection
                {
                    AccountCode = item.AccountCode,
                    AccountName = item.AccountName,
                    Amount = amount
                };

                switch (type)
                {
                    case AccountType.Asset:
                        result.Assets.Add(section);
                        result.TotalAssets += amount;
                        break;
                    case AccountType.Liability:
                        result.Liabilities.Add(section);
                        result.TotalLiabilities += amount;
                        break;
                    case AccountType.Equity:
                        result.Equity.Add(section);
                        result.TotalEquity += amount;
                        break;
                }
            }

            return result;
        }

        public async Task<IncomeStatementDto> GetIncomeStatementAsync(DateTime from, DateTime to)
        {
            var entries = await _db.Set<JournalEntry>()
                .Where(e => e.EntryDate >= from && e.EntryDate <= to)
                .Include(e => e.Lines)
                .ThenInclude(l => l.Account)
                .ToListAsync();

            var lines = entries.SelectMany(e => e.Lines).ToList();

            var result = new IncomeStatementDto();

            foreach (var line in lines)
            {
                var amount = line.Credit > line.Debit ? line.Credit - line.Debit : line.Debit - line.Credit;
                var entry = new IncomeStatementLine
                {
                    AccountCode = line.Account.AccountCode,
                    AccountName = line.Account.AccountName,
                    Amount = amount
                };

                switch (line.Account.Type)
                {
                    case AccountType.Revenue:
                        result.Revenues.Add(entry);
                        result.TotalRevenue += line.Credit - line.Debit;
                        break;
                    case AccountType.Expense:
                        result.Expenses.Add(entry);
                        result.TotalExpenses += line.Debit - line.Credit;
                        break;
                }
            }

            result.NetIncome = result.TotalRevenue - result.TotalExpenses;
            return result;
        }

        public async Task<List<AccountsReceivableAgingDto>> GetAccountsReceivableAgingAsync(DateTime? asOf)
        {
            var cutoffDate = asOf ?? DateTime.UtcNow;

            var invoices = await _db.Invoices
                .Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled)
                .ToListAsync();

            var caseIds = invoices.Select(i => i.LegalCaseId).Distinct().ToList();
            var cases = await _db.LegalCases.Where(c => caseIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id, c => c.ClientName);

            return invoices.Select(i =>
            {
                var daysOverdue = (int)(cutoffDate - i.DueDate).TotalDays;
                string bucket = daysOverdue <= 0 ? "غير متأخرة" :
                    daysOverdue <= 30 ? "0-30 يوم" :
                    daysOverdue <= 60 ? "31-60 يوم" :
                    daysOverdue <= 90 ? "61-90 يوم" : "أكثر من 90 يوم";

                return new AccountsReceivableAgingDto
                {
                    InvoiceId = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    ClientName = cases.TryGetValue(i.LegalCaseId, out var name) ? name : null,
                    IssueDate = i.IssueDate,
                    DueDate = i.DueDate,
                    TotalAmount = i.TotalAmount * i.ExchangeRate,
                    PaidAmount = i.PaidAmount * i.ExchangeRate,
                    BalanceDue = (i.TotalAmount - i.PaidAmount) * i.ExchangeRate,
                    DaysOverdue = Math.Max(0, daysOverdue),
                    AgingBucket = bucket
                };
            })
            .OrderByDescending(a => a.DaysOverdue)
            .ToList();
        }

        public async Task<List<GeneralLedgerEntryDto>> GetGeneralLedgerAsync(Guid accountId, DateTime? from, DateTime? to)
        {
            var query = _db.Set<JournalEntryLine>()
                .Include(l => l.JournalEntry)
                .Where(l => l.AccountId == accountId);

            if (from.HasValue) query = query.Where(l => l.JournalEntry.EntryDate >= from.Value);
            if (to.HasValue) query = query.Where(l => l.JournalEntry.EntryDate <= to.Value);

            var lines = await query
                .OrderBy(l => l.JournalEntry.EntryDate)
                .ThenBy(l => l.JournalEntry.EntryNumber)
                .ToListAsync();

            var result = new List<GeneralLedgerEntryDto>();
            decimal runningBalance = 0;

            foreach (var line in lines)
            {
                runningBalance += line.Debit - line.Credit;
                result.Add(new GeneralLedgerEntryDto
                {
                    EntryDate = line.JournalEntry.EntryDate,
                    EntryNumber = line.JournalEntry.EntryNumber,
                    Description = line.Description ?? line.JournalEntry.Description,
                    ReferenceType = line.JournalEntry.ReferenceType ?? "",
                    Debit = line.Debit,
                    Credit = line.Credit,
                    RunningBalance = runningBalance
                });
            }

            return result;
        }
    }
}
