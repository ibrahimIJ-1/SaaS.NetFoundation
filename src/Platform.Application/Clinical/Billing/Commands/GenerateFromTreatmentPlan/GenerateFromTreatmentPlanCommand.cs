using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;

namespace Platform.Application.Clinical.Billing.Commands.GenerateFromTreatmentPlan
{
    public record GenerateFromTreatmentPlanCommand(Guid PatientId, List<Guid> TreatmentPlanItemIds) : IRequest<Result<Guid>>;

    public class GenerateFromTreatmentPlanCommandHandler : IRequestHandler<GenerateFromTreatmentPlanCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public GenerateFromTreatmentPlanCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(GenerateFromTreatmentPlanCommand request, CancellationToken cancellationToken)
        {
            var items = await _context.TreatmentPlans
                .Where(tp => tp.PatientId == request.PatientId)
                .SelectMany(tp => tp.Items)
                .Where(item => request.TreatmentPlanItemIds.Contains(item.Id))
                .ToListAsync(cancellationToken);

            if (!items.Any())
                return Result<Guid>.Failure("No treatment plan items found.");

            // Generate unique invoice number
            var count = await _context.Invoices.CountAsync(cancellationToken);
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D3}";

            var invoice = new Invoice(request.PatientId, invoiceNumber)
            {
                Status = InvoiceStatus.Unpaid,
                DueDate = DateTime.UtcNow.AddDays(14)
            };

            foreach (var item in items)
            {
                var invoiceItem = new InvoiceItem
                {
                    InvoiceId = invoice.Id,
                    Description = item.ProcedureName,
                    Quantity = 1,
                    UnitPrice = item.Cost,
                    TreatmentPlanItemId = item.Id
                };
                invoice.Items.Add(invoiceItem);
                invoice.TotalAmount += invoiceItem.Total;
            }

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(invoice.Id);
        }
    }
}
