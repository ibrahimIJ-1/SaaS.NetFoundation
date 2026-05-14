using Microsoft.EntityFrameworkCore;
using Platform.Application.DTOs.Accounting;
using Platform.Application.Services;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;

namespace Platform.UnitTests.Services;

public class InvoiceServiceTests
{
    private static async Task<ApplicationDbContext> CreateDbContextAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new ApplicationDbContext(options);
        db.Set<Account>().AddRange(
            new Account { AccountCode = "1100", AccountName = "Cash", Type = AccountType.Asset, Category = AccountCategory.CurrentAsset },
            new Account { AccountCode = "1300", AccountName = "AR", Type = AccountType.Asset, Category = AccountCategory.CurrentAsset },
            new Account { AccountCode = "4100", AccountName = "Revenue", Type = AccountType.Revenue, Category = AccountCategory.OperatingRevenue }
        );
        await db.SaveChangesAsync();
        return db;
    }

    [Fact]
    public async Task CreateInvoice_WithValidData_Succeeds()
    {
        var db = await CreateDbContextAsync();
        var posting = new PostingService(db);
        var service = new InvoiceService(db, posting);

        var legalCase = new LegalCase
        {
            CaseNumber = "2026/001",
            Title = "Test Case",
            ClientName = "Test Client",
            ClientId = "C001",
            CaseType = "Civil",
            CourtInfo = "Court",
            AssignedLawyerId = "L001",
            AssignedLawyerName = "Lawyer"
        };
        db.LegalCases.Add(legalCase);
        await db.SaveChangesAsync();

        var request = new CreateInvoiceRequestDto
        {
            InvoiceNumber = "INV-20260514-001",
            LegalCaseId = legalCase.Id,
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            Items = new List<CreateInvoiceItemDto>
            {
                new() { Description = "Service 1", Quantity = 1, UnitPrice = 1000, TaxRate = 15 }
            }
        };

        var result = await service.CreateAsync(request);

        Assert.NotNull(result);
        Assert.Equal("INV-20260514-001", result.InvoiceNumber);
        Assert.Equal(1000m, result.SubTotal);
        Assert.Equal(150m, result.TaxTotal);
        Assert.Equal(1150m, result.TotalAmount);
        Assert.Equal("Draft", result.Status);
    }

    [Fact]
    public async Task CreateInvoice_WithoutCurrency_UsesBaseCurrency()
    {
        var db = await CreateDbContextAsync();
        db.Currencies.Add(new Currency { Code = "IQD", Name = "دينار", Symbol = "د.ع", ExchangeRate = 1.0m, IsBase = true });
        db.Currencies.Add(new Currency { Code = "USD", Name = "دولار", Symbol = "$", ExchangeRate = 1500m, IsBase = false });
        var legalCase = new LegalCase
        {
            CaseNumber = "2026/002", Title = "Test", ClientName = "C", ClientId = "C1",
            CaseType = "Civil", CourtInfo = "C", AssignedLawyerId = "L1", AssignedLawyerName = "L"
        };
        db.LegalCases.Add(legalCase);
        await db.SaveChangesAsync();
        var posting = new PostingService(db);
        var service = new InvoiceService(db, posting);

        var result = await service.CreateAsync(new CreateInvoiceRequestDto
        {
            InvoiceNumber = "INV-001",
            LegalCaseId = legalCase.Id,
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            Items = new List<CreateInvoiceItemDto> { new() { Description = "Svc", Quantity = 1, UnitPrice = 500, TaxRate = 0 } }
        });

        Assert.NotNull(result.CurrencyId);
    }

    [Fact]
    public async Task UpdateStatus_FromDraftToSent_Succeeds()
    {
        var db = await CreateDbContextAsync();
        var posting = new PostingService(db);
        var service = new InvoiceService(db, posting);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-001",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            TotalAmount = 1000,
            Status = InvoiceStatus.Draft
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        var result = await service.UpdateStatusAsync(invoice.Id, new UpdateInvoiceStatusDto { Status = "Sent" });

        Assert.NotNull(result);
        Assert.Equal("Sent", result.Status);
    }

    [Fact]
    public async Task UpdateStatus_FromPaidToDraft_Throws()
    {
        var db = await CreateDbContextAsync();
        var posting = new PostingService(db);
        var service = new InvoiceService(db, posting);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-002",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            TotalAmount = 1000,
            PaidAmount = 1000,
            Status = InvoiceStatus.Paid
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateStatusAsync(invoice.Id, new UpdateInvoiceStatusDto { Status = "Draft" }));
    }

    [Fact]
    public async Task GetByCase_ReturnsOnlyCaseInvoices()
    {
        var db = await CreateDbContextAsync();
        var posting = new PostingService(db);
        var service = new InvoiceService(db, posting);

        var now = DateTime.UtcNow;
        var case1 = Guid.NewGuid();
        var case2 = Guid.NewGuid();
        db.Invoices.AddRange(
            new Invoice { InvoiceNumber = "INV-001", LegalCaseId = case1, IssueDate = now, DueDate = now, TotalAmount = 100, Status = InvoiceStatus.Draft },
            new Invoice { InvoiceNumber = "INV-002", LegalCaseId = case2, IssueDate = now, DueDate = now, TotalAmount = 200, Status = InvoiceStatus.Draft },
            new Invoice { InvoiceNumber = "INV-003", LegalCaseId = case1, IssueDate = now, DueDate = now, TotalAmount = 300, Status = InvoiceStatus.Draft }
        );
        await db.SaveChangesAsync();

        var allInDb = await db.Invoices.ToListAsync();
        Assert.Equal(3, allInDb.Count);

        var result = await service.GetByCaseAsync(case1);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetStats_ReturnsCorrectAggregations()
    {
        var db = await CreateDbContextAsync();
        var posting = new PostingService(db);
        var service = new InvoiceService(db, posting);

        db.Invoices.AddRange(
            new Invoice { InvoiceNumber = "INV-001", LegalCaseId = Guid.NewGuid(), IssueDate = DateTime.UtcNow, DueDate = DateTime.UtcNow, TotalAmount = 1000, PaidAmount = 1000, Status = InvoiceStatus.Paid, ExchangeRate = 1 },
            new Invoice { InvoiceNumber = "INV-002", LegalCaseId = Guid.NewGuid(), IssueDate = DateTime.UtcNow, DueDate = DateTime.UtcNow, TotalAmount = 500, PaidAmount = 200, Status = InvoiceStatus.Partial, ExchangeRate = 1 },
            new Invoice { InvoiceNumber = "INV-003", LegalCaseId = Guid.NewGuid(), IssueDate = DateTime.UtcNow, DueDate = DateTime.UtcNow, TotalAmount = 300, PaidAmount = 0, Status = InvoiceStatus.Sent, ExchangeRate = 1 }
        );
        await db.SaveChangesAsync();

        var stats = await service.GetStatsAsync();

        Assert.Equal(1800, stats.TotalInvoiced);
        Assert.Equal(1200, stats.TotalCollected);
        Assert.Equal(600, stats.PendingAmount);
    }
}
