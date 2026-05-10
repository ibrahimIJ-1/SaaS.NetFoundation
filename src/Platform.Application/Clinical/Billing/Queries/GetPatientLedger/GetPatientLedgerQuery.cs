using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Billing.Queries.GetPatientLedger
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Method { get; set; } = default!;
        public DateTime Date { get; set; }
        public string? TransactionId { get; set; }
    }

    public class InvoiceItemDto
    {
        public string Description { get; set; } = default!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }

    public class InvoiceDto
    {
        public Guid Id { get; set; }
        public string InvoiceNumber { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal Balance { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime DueDate { get; set; }
        public List<InvoiceItemDto> Items { get; set; } = new();
        public List<PaymentDto> Payments { get; set; } = new();
    }

    public class GetPatientLedgerQuery : IRequest<Result<List<InvoiceDto>>>
    {
        public Guid PatientId { get; set; }
    }

    public class GetPatientLedgerQueryHandler : IRequestHandler<GetPatientLedgerQuery, Result<List<InvoiceDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetPatientLedgerQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<InvoiceDto>>> Handle(GetPatientLedgerQuery request, CancellationToken cancellationToken)
        {
            var invoices = await _context.Invoices
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .Where(i => i.PatientId == request.PatientId)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new InvoiceDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    TotalAmount = i.TotalAmount,
                    PaidAmount = i.PaidAmount,
                    Balance = i.TotalAmount - i.PaidAmount,
                    Status = i.Status.ToString(),
                    CreatedAt = i.CreatedAt,
                    DueDate = i.DueDate,
                    Items = i.Items.Select(item => new InvoiceItemDto
                    {
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        Total = item.Total
                    }).ToList(),
                    Payments = i.Payments.Select(p => new PaymentDto
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        Method = p.Method.ToString(),
                        Date = p.Date,
                        TransactionId = p.TransactionId
                    }).ToList()
                })
                .ToListAsync(cancellationToken);

            return Result<List<InvoiceDto>>.Success(invoices);
        }
    }
}
