using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Billing.Commands.RecordPayment
{
    public class RecordPaymentCommand : IRequest<Result>
    {
        public Guid InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }

    public class RecordPaymentCommandHandler : IRequestHandler<RecordPaymentCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public RecordPaymentCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

            if (invoice == null)
                return Result.Failure("Invoice not found.");

            if (request.Amount <= 0)
                return Result.Failure("Amount must be greater than zero.");

            var payment = new Payment
            {
                InvoiceId = invoice.Id,
                Amount = request.Amount,
                Method = request.Method,
                TransactionId = request.TransactionId,
                Notes = request.Notes,
                Date = DateTime.UtcNow
            };

            invoice.Payments.Add(payment);
            invoice.PaidAmount += request.Amount;
            invoice.UpdateStatus();

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
