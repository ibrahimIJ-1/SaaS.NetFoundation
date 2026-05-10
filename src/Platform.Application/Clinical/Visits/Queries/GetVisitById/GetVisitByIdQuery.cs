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

namespace Platform.Application.Clinical.Visits.Queries.GetVisitById
{
    public class VisitDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = default!;
        public string DoctorId { get; set; } = default!;
        public DateTime Date { get; set; }
        public string Status { get; set; } = default!;
        public string? ChiefComplaint { get; set; }
        public string? SubjectiveNotes { get; set; }
        public string? ObjectiveNotes { get; set; }
        public string? Assessment { get; set; }
        public string? Plan { get; set; }
    }

    public class GetVisitByIdQuery : IRequest<Result<VisitDto>>
    {
        public Guid VisitId { get; set; }
    }

    public class GetVisitByIdQueryHandler : IRequestHandler<GetVisitByIdQuery, Result<VisitDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetVisitByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<VisitDto>> Handle(GetVisitByIdQuery request, CancellationToken cancellationToken)
        {
            var visit = await _context.Visits
                .Include(v => v.Patient)
                .Where(v => v.Id == request.VisitId)
                .Select(v => new VisitDto
                {
                    Id = v.Id,
                    PatientId = v.PatientId,
                    PatientName = v.Patient.FullName,
                    DoctorId = v.DoctorId,
                    Date = v.Date,
                    Status = v.Status.ToString(),
                    ChiefComplaint = v.ChiefComplaint,
                    SubjectiveNotes = v.SubjectiveNotes,
                    ObjectiveNotes = v.ObjectiveNotes,
                    Assessment = v.Assessment,
                    Plan = v.Plan
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (visit == null)
                return Result<VisitDto>.Failure("Visit not found.");

            return Result<VisitDto>.Success(visit);
        }
    }
}
