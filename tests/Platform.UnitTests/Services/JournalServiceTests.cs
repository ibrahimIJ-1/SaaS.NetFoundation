using Microsoft.EntityFrameworkCore;
using Platform.Application.Services;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;

namespace Platform.UnitTests.Services;

public class JournalServiceTests
{
    private ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private async Task SeedAccountsAsync(ApplicationDbContext db)
    {
        db.Set<Account>().AddRange(
            new Account { AccountCode = "1100", AccountName = "Cash", Type = AccountType.Asset, Category = AccountCategory.CurrentAsset },
            new Account { AccountCode = "1300", AccountName = "AR", Type = AccountType.Asset, Category = AccountCategory.CurrentAsset },
            new Account { AccountCode = "4100", AccountName = "Revenue", Type = AccountType.Revenue, Category = AccountCategory.OperatingRevenue },
            new Account { AccountCode = "5100", AccountName = "Rent", Type = AccountType.Expense, Category = AccountCategory.OperatingExpense }
        );
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetTrialBalance_ReturnsBalancedResult()
    {
        var db = CreateDbContext();
        await SeedAccountsAsync(db);

        var accounts = await db.Set<Account>().ToListAsync();
        var ar = accounts.First(a => a.AccountCode == "1300");
        var rev = accounts.First(a => a.AccountCode == "4100");

        var entry = new JournalEntry
        {
            EntryNumber = "JE-20260514-0001",
            EntryDate = DateTime.UtcNow,
            Description = "Test entry",
            Type = JournalEntryType.Invoice,
            IsPosted = true
        };
        entry.Lines.Add(new JournalEntryLine { AccountId = ar.Id, Debit = 1000, Credit = 0, ExchangeRate = 1 });
        entry.Lines.Add(new JournalEntryLine { AccountId = rev.Id, Debit = 0, Credit = 1000, ExchangeRate = 1 });
        db.Set<JournalEntry>().Add(entry);
        await db.SaveChangesAsync();

        var service = new JournalService(db);
        var trialBalance = await service.GetTrialBalanceAsync(null);

        Assert.NotEmpty(trialBalance);
        var totalDebit = trialBalance.Sum(t => t.TotalDebit);
        var totalCredit = trialBalance.Sum(t => t.TotalCredit);
        Assert.Equal(totalDebit, totalCredit);
    }

    [Fact]
    public async Task GetBalanceSheet_ReturnsValidStructure()
    {
        var db = CreateDbContext();
        await SeedAccountsAsync(db);

        var accounts = await db.Set<Account>().ToListAsync();
        var ar = accounts.First(a => a.AccountCode == "1300");
        var rev = accounts.First(a => a.AccountCode == "4100");

        var entry = new JournalEntry
        {
            EntryNumber = "JE-20260514-0002",
            EntryDate = DateTime.UtcNow,
            Description = "BS test",
            Type = JournalEntryType.Invoice,
            IsPosted = true
        };
        entry.Lines.Add(new JournalEntryLine { AccountId = ar.Id, Debit = 5000, Credit = 0, ExchangeRate = 1 });
        entry.Lines.Add(new JournalEntryLine { AccountId = rev.Id, Debit = 0, Credit = 5000, ExchangeRate = 1 });
        db.Set<JournalEntry>().Add(entry);
        await db.SaveChangesAsync();

        var service = new JournalService(db);
        var bs = await service.GetBalanceSheetAsync(null);

        Assert.NotEmpty(bs.Assets);
        Assert.Equal(5000, bs.TotalAssets);
    }

    [Fact]
    public async Task GetIncomeStatement_ReturnsValidStructure()
    {
        var db = CreateDbContext();
        await SeedAccountsAsync(db);

        var accounts = await db.Set<Account>().ToListAsync();
        var rev = accounts.First(a => a.AccountCode == "4100");
        var rent = accounts.First(a => a.AccountCode == "5100");

        var entry = new JournalEntry
        {
            EntryNumber = "JE-20260514-0003",
            EntryDate = DateTime.UtcNow.AddDays(-1),
            Description = "IS test",
            Type = JournalEntryType.Invoice,
            IsPosted = true
        };
        entry.Lines.Add(new JournalEntryLine { AccountId = rev.Id, Debit = 0, Credit = 10000, ExchangeRate = 1 });
        entry.Lines.Add(new JournalEntryLine { AccountId = rent.Id, Debit = 3000, Credit = 0, ExchangeRate = 1 });
        entry.Lines.Add(new JournalEntryLine { AccountId = accounts.First(a => a.AccountCode == "1100").Id, Debit = 0, Credit = 7000, ExchangeRate = 1 });
        db.Set<JournalEntry>().Add(entry);
        await db.SaveChangesAsync();

        var service = new JournalService(db);
        var from = DateTime.UtcNow.AddMonths(-1);
        var to = DateTime.UtcNow.AddDays(1);
        var is_ = await service.GetIncomeStatementAsync(from, to);

        Assert.Equal(10000, is_.TotalRevenue);
        Assert.Equal(3000, is_.TotalExpenses);
        Assert.Equal(7000, is_.NetIncome);
    }

    [Fact]
    public async Task GetAccountsReceivableAging_ReturnsOverdueInfo()
    {
        var db = CreateDbContext();
        var service = new JournalService(db);

        db.Invoices.AddRange(
            new Invoice
            {
                InvoiceNumber = "INV-001", LegalCaseId = Guid.NewGuid(),
                IssueDate = DateTime.UtcNow.AddDays(-60), DueDate = DateTime.UtcNow.AddDays(-30),
                TotalAmount = 1000, Status = InvoiceStatus.Sent, ExchangeRate = 1
            },
            new Invoice
            {
                InvoiceNumber = "INV-002", LegalCaseId = Guid.NewGuid(),
                IssueDate = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddDays(15),
                TotalAmount = 500, Status = InvoiceStatus.Sent, ExchangeRate = 1
            }
        );
        await db.SaveChangesAsync();

        var aging = await service.GetAccountsReceivableAgingAsync(null);

        Assert.Equal(2, aging.Count);
        Assert.Contains(aging, a => a.DaysOverdue >= 30);
        Assert.Contains(aging, a => a.DaysOverdue == 0);
    }
}
