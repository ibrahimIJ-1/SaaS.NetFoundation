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

namespace Platform.Application.Clinical.Billing.Queries.GetBillingSummary
{
    public class BillingSummaryDto
    {
        public decimal TotalOutstanding { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public decimal CollectedThisMonth { get; set; }
        public List<RecentInvoiceDto> RecentInvoices { get; set; } = new();
    }

    public class RecentInvoiceDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string InvoiceNumber { get; set; } = default!;
        public string PatientName { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public decimal Balance { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }

    public class GetBillingSummaryQuery : IRequest<Result<BillingSummaryDto>>
    {
    }

    public class GetBillingSummaryQueryHandler : IRequestHandler<GetBillingSummaryQuery, Result<BillingSummaryDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetBillingSummaryQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<BillingSummaryDto>> Handle(GetBillingSummaryQuery request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var invoices = await _context.Invoices
                .Include(i => i.Patient)
                .Where(i => i.Status != InvoiceStatus.Void)
                .ToListAsync(cancellationToken);

            var summary = new BillingSummaryDto
            {
                TotalOutstanding = invoices.Sum(i => i.TotalAmount - i.PaidAmount),
                TotalRevenue = invoices.Sum(i => i.TotalAmount),
                TotalCollected = invoices.Sum(i => i.PaidAmount),
                
                RevenueThisMonth = invoices
                    .Where(i => i.CreatedAt >= startOfMonth)
                    .Sum(i => i.TotalAmount),
                
                CollectedThisMonth = invoices
                    .Where(i => i.CreatedAt >= startOfMonth)
                    .Sum(i => i.PaidAmount),

                RecentInvoices = invoices
                    .OrderByDescending(i => i.CreatedAt)
                    .Take(10)
                    .Select(i => new RecentInvoiceDto
                    {
                        Id = i.Id,
                        PatientId = i.PatientId,
                        InvoiceNumber = i.InvoiceNumber,
                        PatientName = i.Patient.FullName,
                        TotalAmount = i.TotalAmount,
                        Balance = i.TotalAmount - i.PaidAmount,
                        Status = i.Status.ToString(),
                        CreatedAt = i.CreatedAt
                    }).ToList()
            };

            return Result<BillingSummaryDto>.Success(summary);
        }
    }
}
