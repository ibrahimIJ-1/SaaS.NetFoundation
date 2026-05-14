using Microsoft.EntityFrameworkCore;
using Platform.Application.DTOs.Accounting;
using Platform.Application.Services;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;

namespace Platform.UnitTests.Services;

public class PaymentServiceTests
{
    private ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task RecordPayment_UpdatesInvoiceBalance()
    {
        var db = CreateDbContext();
        var posting = new PostingService(db);
        var service = new PaymentService(db, posting);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-001",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            TotalAmount = 1000,
            PaidAmount = 0,
            Status = InvoiceStatus.Sent,
            ExchangeRate = 1
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        var result = await service.RecordPaymentAsync(new RecordPaymentRequestDto
        {
            InvoiceId = invoice.Id,
            Amount = 600,
            PaymentDate = DateTime.UtcNow,
            Method = "Cash"
        });

        Assert.NotNull(result);
        Assert.Equal(600, result.Amount);

        var updatedInvoice = await db.Invoices.FindAsync(invoice.Id);
        Assert.NotNull(updatedInvoice);
        Assert.Equal(600, updatedInvoice.PaidAmount);
        Assert.Equal(InvoiceStatus.Partial, updatedInvoice.Status);
    }

    [Fact]
    public async Task RecordPayment_FullPayment_MarksInvoicePaid()
    {
        var db = CreateDbContext();
        var posting = new PostingService(db);
        var service = new PaymentService(db, posting);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-002",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            TotalAmount = 1000,
            PaidAmount = 0,
            Status = InvoiceStatus.Sent,
            ExchangeRate = 1
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        await service.RecordPaymentAsync(new RecordPaymentRequestDto
        {
            InvoiceId = invoice.Id,
            Amount = 1000,
            PaymentDate = DateTime.UtcNow,
            Method = "BankTransfer"
        });

        var updatedInvoice = await db.Invoices.FindAsync(invoice.Id);
        Assert.NotNull(updatedInvoice);
        Assert.Equal(InvoiceStatus.Paid, updatedInvoice.Status);
    }

    [Fact]
    public async Task RecordPayment_OnCancelledInvoice_Throws()
    {
        var db = CreateDbContext();
        var posting = new PostingService(db);
        var service = new PaymentService(db, posting);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-003",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow,
            TotalAmount = 1000,
            Status = InvoiceStatus.Cancelled,
            ExchangeRate = 1
        };
        db.Invoices.Add(invoice);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RecordPaymentAsync(new RecordPaymentRequestDto
            {
                InvoiceId = invoice.Id,
                Amount = 100,
                PaymentDate = DateTime.UtcNow,
                Method = "Cash"
            }));
    }

    [Fact]
    public async Task DeletePayment_ReversesInvoiceBalance()
    {
        var db = CreateDbContext();
        var posting = new PostingService(db);
        var service = new PaymentService(db, posting);

        var invoice = new Invoice
        {
            InvoiceNumber = "INV-004",
            LegalCaseId = Guid.NewGuid(),
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow,
            TotalAmount = 1000,
            PaidAmount = 800,
            Status = InvoiceStatus.Partial,
            ExchangeRate = 1
        };
        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            Amount = 800,
            PaymentDate = DateTime.UtcNow,
            Method = PaymentMethod.Cash
        };
        db.Invoices.Add(invoice);
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        await service.DeletePaymentAsync(payment.Id);

        var updatedInvoice = await db.Invoices.FindAsync(invoice.Id);
        Assert.NotNull(updatedInvoice);
        Assert.Equal(0, updatedInvoice.PaidAmount);
        Assert.Equal(InvoiceStatus.Sent, updatedInvoice.Status);
    }
}
