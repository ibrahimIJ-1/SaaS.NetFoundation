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
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPostingService _postingService;

        public PaymentService(ApplicationDbContext dbContext, IPostingService postingService)
        {
            _dbContext = dbContext;
            _postingService = postingService;
        }

        public async Task<List<PaymentListDto>> GetAllAsync()
        {
            return await _dbContext.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i.LegalCase)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentListDto
                {
                    Id = p.Id,
                    InvoiceId = p.InvoiceId,
                    InvoiceNumber = p.Invoice.InvoiceNumber,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    Method = p.Method.ToString(),
                    ReferenceNumber = p.ReferenceNumber
                })
                .ToListAsync();
        }

        public async Task<List<PaymentListDto>> GetByInvoiceAsync(Guid invoiceId)
        {
            return await _dbContext.Payments
                .Where(p => p.InvoiceId == invoiceId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentListDto
                {
                    Id = p.Id,
                    InvoiceId = p.InvoiceId,
                    InvoiceNumber = p.Invoice.InvoiceNumber,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    Method = p.Method.ToString(),
                    ReferenceNumber = p.ReferenceNumber
                })
                .ToListAsync();
        }

        public async Task<List<PaymentListDto>> GetRecentAsync(int count = 10)
        {
            return await _dbContext.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i.LegalCase)
                .OrderByDescending(p => p.PaymentDate)
                .Take(count)
                .Select(p => new PaymentListDto
                {
                    Id = p.Id,
                    InvoiceId = p.InvoiceId,
                    InvoiceNumber = p.Invoice.InvoiceNumber,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    Method = p.Method.ToString(),
                    ReferenceNumber = p.ReferenceNumber
                })
                .ToListAsync();
        }

        public async Task<PaymentDto> RecordPaymentAsync(RecordPaymentRequestDto request)
        {
            var invoice = await _dbContext.Invoices.FindAsync(request.InvoiceId)
                ?? throw new InvalidOperationException("Invoice not found.");

            if (invoice.Status == InvoiceStatus.Cancelled)
                throw new InvalidOperationException("Cannot record payment against a cancelled invoice.");

            var payment = new Payment
            {
                InvoiceId = request.InvoiceId,
                Amount = request.Amount,
                PaymentDate = request.PaymentDate,
                Method = Enum.Parse<PaymentMethod>(request.Method),
                ReferenceNumber = request.ReferenceNumber,
                Notes = request.Notes,
                CurrencyId = invoice.CurrencyId,
                ExchangeRate = invoice.ExchangeRate
            };

            _dbContext.Payments.Add(payment);

            invoice.PaidAmount += payment.Amount;
            if (invoice.PaidAmount >= invoice.TotalAmount)
                invoice.Status = InvoiceStatus.Paid;
            else if (invoice.PaidAmount > 0)
                invoice.Status = InvoiceStatus.Partial;

            await _dbContext.SaveChangesAsync();

            // Post journal entry for payment
            await _postingService.PostPaymentRecordedAsync(payment.Id);

            return new PaymentDto
            {
                Id = payment.Id,
                InvoiceId = payment.InvoiceId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Method = payment.Method.ToString(),
                ReferenceNumber = payment.ReferenceNumber,
                Notes = payment.Notes,
                CurrencyId = payment.CurrencyId,
                ExchangeRate = payment.ExchangeRate
            };
        }

        public async Task DeletePaymentAsync(Guid id)
        {
            var payment = await _dbContext.Payments.FindAsync(id)
                ?? throw new InvalidOperationException("Payment not found.");

            var invoice = await _dbContext.Invoices.FindAsync(payment.InvoiceId);
            if (invoice != null)
            {
                invoice.PaidAmount -= payment.Amount;
                if (invoice.PaidAmount <= 0)
                    invoice.Status = InvoiceStatus.Sent;
                else if (invoice.PaidAmount < invoice.TotalAmount)
                    invoice.Status = InvoiceStatus.Partial;
            }

            _dbContext.Payments.Remove(payment);
            await _dbContext.SaveChangesAsync();
        }
    }
}
