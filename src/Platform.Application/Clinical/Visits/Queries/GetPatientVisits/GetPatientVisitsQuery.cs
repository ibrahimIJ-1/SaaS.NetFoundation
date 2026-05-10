using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Application.Clinical.Visits.Queries.GetVisitById;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Visits.Queries.GetPatientVisits
{
    public class GetPatientVisitsQuery : IRequest<Result<List<VisitDto>>>
    {
        public Guid PatientId { get; set; }
    }

    public class GetPatientVisitsQueryHandler : IRequestHandler<GetPatientVisitsQuery, Result<List<VisitDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetPatientVisitsQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<VisitDto>>> Handle(GetPatientVisitsQuery request, CancellationToken cancellationToken)
        {
            var visits = await _context.Visits
                .Where(v => v.PatientId == request.PatientId && v.IsActive)
                .OrderByDescending(v => v.Date)
                .Select(v => new VisitDto
                {
                    Id = v.Id,
                    PatientId = v.PatientId,
                    DoctorId = v.DoctorId,
                    Date = v.Date,
                    Status = v.Status.ToString(),
                    ChiefComplaint = v.ChiefComplaint,
                    SubjectiveNotes = v.SubjectiveNotes,
                    ObjectiveNotes = v.ObjectiveNotes,
                    Assessment = v.Assessment,
                    Plan = v.Plan
                })
                .ToListAsync(cancellationToken);

            return Result<List<VisitDto>>.Success(visits);
        }
    }
}
