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

namespace Platform.Application.Clinical.Billing.Queries.GetInvoices
{
    public class InvoiceListItemDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string InvoiceNumber { get; set; } = default!;
        public string PatientName { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal Balance { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class GetInvoicesQuery : IRequest<Result<List<InvoiceListItemDto>>>
    {
        public string? Search { get; set; }
        public InvoiceStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, Result<List<InvoiceListItemDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetInvoicesQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<InvoiceListItemDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Invoices
                .Include(i => i.Patient)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Search))
            {
                query = query.Where(i => i.Patient.FullName.Contains(request.Search) || i.InvoiceNumber.Contains(request.Search));
            }

            if (request.Status.HasValue)
            {
                query = query.Where(i => i.Status == request.Status.Value);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(i => i.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(i => i.CreatedAt <= request.ToDate.Value);
            }

            var invoices = await query
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new InvoiceListItemDto
                {
                    Id = i.Id,
                    PatientId = i.PatientId,
                    InvoiceNumber = i.InvoiceNumber,
                    PatientName = i.Patient.FullName,
                    TotalAmount = i.TotalAmount,
                    PaidAmount = i.PaidAmount,
                    Balance = i.TotalAmount - i.PaidAmount,
                    Status = i.Status.ToString(),
                    CreatedAt = i.CreatedAt,
                    DueDate = i.DueDate
                })
                .ToListAsync(cancellationToken);

            return Result<List<InvoiceListItemDto>>.Success(invoices);
        }
    }
}
