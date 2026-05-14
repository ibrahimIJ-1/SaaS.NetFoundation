using Microsoft.EntityFrameworkCore;
using Platform.Application.Services;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;

namespace Platform.UnitTests.Services;

public class PostingServiceTests
{
    private ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task PostInvoiceCreated_CreatesBalancedJournalEntry()
    {
        var db = CreateDbContext();
        var service = new PostingService(db);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-001",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            TotalAmount = 1000,
            Status = InvoiceStatus.Sent,
            ExchangeRate = 1
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        await service.PostInvoiceCreatedAsync(invoice.Id);

        var entries = await db.Set<JournalEntry>()
            .Include(e => e.Lines)
            .ToListAsync();

        Assert.Single(entries);
        Assert.Equal(2, entries[0].Lines.Count);

        var totalDebit = entries[0].Lines.Sum(l => l.Debit);
        var totalCredit = entries[0].Lines.Sum(l => l.Credit);
        Assert.Equal(totalDebit, totalCredit);
        Assert.Equal(1000, totalDebit);
    }

    [Fact]
    public async Task PostPaymentRecorded_CreatesBalancedJournalEntry()
    {
        var db = CreateDbContext();
        var service = new PostingService(db);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-001", LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow, DueDate = DateTime.UtcNow,
            TotalAmount = 1000, Status = InvoiceStatus.Sent, ExchangeRate = 1
        };
        var payment = new Payment
        {
            InvoiceId = Guid.Empty, Amount = 500, PaymentDate = DateTime.UtcNow,
            Method = PaymentMethod.Cash, ExchangeRate = 1
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();
        payment.InvoiceId = invoice.Id;
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        await service.PostPaymentRecordedAsync(payment.Id);

        var entries = await db.Set<JournalEntry>()
            .Include(e => e.Lines)
            .ToListAsync();

        Assert.Single(entries);
        var totalDebit = entries[0].Lines.Sum(l => l.Debit);
        var totalCredit = entries[0].Lines.Sum(l => l.Credit);
        Assert.Equal(totalDebit, totalCredit);
    }

    [Fact]
    public async Task PostExpenseRecorded_CreatesBalancedJournalEntry()
    {
        var db = CreateDbContext();
        var service = new PostingService(db);

        var expense = new Expense
        {
            LegalCaseId = Guid.NewGuid(),
            Description = "Court fees",
            Amount = 200,
            ExpenseDate = DateTime.UtcNow,
            Category = "CourtFees",
            ExchangeRate = 1,
            CreatedBy = "test"
        };
        db.Expenses.Add(expense);
        await db.SaveChangesAsync();

        await service.PostExpenseRecordedAsync(expense.Id);

        var entries = await db.Set<JournalEntry>()
            .Include(e => e.Lines)
            .ToListAsync();

        Assert.Single(entries);
        var totalDebit = entries[0].Lines.Sum(l => l.Debit);
        var totalCredit = entries[0].Lines.Sum(l => l.Credit);
        Assert.Equal(totalDebit, totalCredit);
    }

    [Fact]
    public async Task PostTrustDeposit_CreatesBalancedJournalEntry()
    {
        var db = CreateDbContext();
        var service = new PostingService(db);

        var tt = new TrustTransaction
        {
            LegalCaseId = Guid.NewGuid(),
            Amount = 5000,
            Type = TrustTransactionType.Deposit,
            TransactionDate = DateTime.UtcNow,
            Description = "Trust deposit",
            ExchangeRate = 1
        };
        db.TrustTransactions.Add(tt);
        await db.SaveChangesAsync();

        await service.PostTrustTransactionAsync(tt.Id);

        var entries = await db.Set<JournalEntry>()
            .Include(e => e.Lines)
            .ToListAsync();

        Assert.Single(entries);
        var totalDebit = entries[0].Lines.Sum(l => l.Debit);
        var totalCredit = entries[0].Lines.Sum(l => l.Credit);
        Assert.Equal(totalDebit, totalCredit);
    }

    [Fact]
    public async Task JournalEntries_AlwaysBalanced()
    {
        var db = CreateDbContext();
        var service = new PostingService(db);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-001", LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow, DueDate = DateTime.UtcNow,
            TotalAmount = 1500, Status = InvoiceStatus.Sent, ExchangeRate = 1
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        await service.PostInvoiceCreatedAsync(invoice.Id);

        var payment = new Payment
        {
            InvoiceId = invoice.Id, Amount = 1500, PaymentDate = DateTime.UtcNow,
            Method = PaymentMethod.BankTransfer, ExchangeRate = 1
        };
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        await service.PostPaymentRecordedAsync(payment.Id);

        var entries = await db.Set<JournalEntry>()
            .Include(e => e.Lines)
            .ToListAsync();

        Assert.Equal(2, entries.Count);
        foreach (var entry in entries)
        {
            var debit = entry.Lines.Sum(l => l.Debit);
            var credit = entry.Lines.Sum(l => l.Credit);
            Assert.Equal(debit, credit);
        }
    }
}
