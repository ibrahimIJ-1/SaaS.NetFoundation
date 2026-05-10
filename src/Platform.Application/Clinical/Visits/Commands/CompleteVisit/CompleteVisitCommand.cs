using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Visits.Commands.CompleteVisit
{
    public class CompleteVisitCommand : IRequest<Result>
    {
        public Guid VisitId { get; set; }
    }

    public class CompleteVisitCommandHandler : IRequestHandler<CompleteVisitCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public CompleteVisitCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(CompleteVisitCommand request, CancellationToken cancellationToken)
        {
            var visit = await _context.Visits
                .Include(v => v.Appointment)
                .Include(v => v.PerformedProcedures)
                .FirstOrDefaultAsync(v => v.Id == request.VisitId, cancellationToken);

            if (visit == null)
                return Result.Failure("Visit not found.");

            visit.Status = VisitStatus.Completed;

            if (visit.Appointment != null)
            {
                visit.Appointment.Status = AppointmentStatus.Completed;
            }

            // Generate Draft Invoice if procedures were performed
            if (visit.PerformedProcedures.Any())
            {
                var invoice = new Invoice(visit.PatientId, $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}")
                {
                    VisitId = visit.Id,
                    Status = InvoiceStatus.Draft,
                    TotalAmount = visit.PerformedProcedures.Sum(p => p.Cost)
                };

                foreach (var procedure in visit.PerformedProcedures)
                {
                    invoice.Items.Add(new InvoiceItem
                    {
                        Description = procedure.ProcedureName + (procedure.ToothNumber.HasValue ? $" (Tooth {procedure.ToothNumber})" : ""),
                        Quantity = 1,
                        UnitPrice = procedure.Cost,
                        TreatmentPlanItemId = procedure.Id
                    });
                }

                _context.Invoices.Add(invoice);
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
