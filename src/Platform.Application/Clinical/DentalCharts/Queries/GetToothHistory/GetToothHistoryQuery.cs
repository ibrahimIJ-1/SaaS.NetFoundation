using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Persistence;

namespace Platform.Application.Clinical.DentalCharts.Queries.GetToothHistory
{
    public record GetToothHistoryQuery(Guid PatientId, int ToothNumber) : IRequest<Result<List<ToothHistoryItemDto>>>;

    public class ToothHistoryItemDto
    {
        public DateTime Date { get; set; }
        public string Type { get; set; } = default!; // "Procedure" or "Session"
        public string Description { get; set; } = default!;
        public string? Notes { get; set; }
        public string? DoctorName { get; set; }
        public string? VisitId { get; set; }
    }

    public class GetToothHistoryQueryHandler : IRequestHandler<GetToothHistoryQuery, Result<List<ToothHistoryItemDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetToothHistoryQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<ToothHistoryItemDto>>> Handle(GetToothHistoryQuery request, CancellationToken cancellationToken)
        {
            // Get all Treatment Plan Items for this tooth
            var procedures = await _context.TreatmentPlanItems
                .Include(tpi => tpi.TreatmentPlan)
                .Include(tpi => tpi.SessionRecords)
                    .ThenInclude(sr => sr.Visit)
                .Where(tpi => tpi.TreatmentPlan.PatientId == request.PatientId && tpi.ToothNumber == request.ToothNumber)
                .ToListAsync(cancellationToken);

            var history = new List<ToothHistoryItemDto>();

            foreach (var proc in procedures)
            {
                // Add the overall procedure if it's completed
                if (proc.CompletionDate.HasValue)
                {
                    history.Add(new ToothHistoryItemDto
                    {
                        Date = proc.CompletionDate.Value,
                        Type = "Procedure Completed",
                        Description = proc.ProcedureName,
                        VisitId = proc.PerformedInVisitId?.ToString()
                    });
                }

                // Add individual sessions
                foreach (var session in proc.SessionRecords)
                {
                    history.Add(new ToothHistoryItemDto
                    {
                        Date = session.StartTime,
                        Type = "Clinical Session",
                        Description = session.Description,
                        Notes = session.Notes,
                        VisitId = session.VisitId.ToString()
                    });
                }
            }

            return Result<List<ToothHistoryItemDto>>.Success(history.OrderByDescending(h => h.Date).ToList());
        }
    }
}
