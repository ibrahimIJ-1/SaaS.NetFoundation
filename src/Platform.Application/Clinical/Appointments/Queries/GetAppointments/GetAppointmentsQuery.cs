using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Clinical.Appointments.DTOs;
using Platform.Application.Common;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Appointments.Queries.GetAppointments
{
    public class GetAppointmentsQuery : IRequest<Result<List<AppointmentDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? PatientId { get; set; }
        public string? DoctorId { get; set; }
    }

    public class GetAppointmentsQueryHandler : IRequestHandler<GetAppointmentsQuery, Result<List<AppointmentDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetAppointmentsQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<AppointmentDto>>> Handle(GetAppointmentsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Visit)
                .Include(a => a.Chair)
                .Where(a => a.IsActive);

            if (request.StartDate.HasValue)
                query = query.Where(a => a.StartTime >= request.StartDate.Value);

            if (request.EndDate.HasValue)
                query = query.Where(a => a.EndTime <= request.EndDate.Value);

            if (request.PatientId.HasValue)
                query = query.Where(a => a.PatientId == request.PatientId.Value);

            if (!string.IsNullOrEmpty(request.DoctorId))
                query = query.Where(a => a.DoctorId == request.DoctorId);

            var appointments = await query
                .OrderBy(a => a.StartTime)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FirstName + " " + a.Patient.LastName,
                    DoctorId = a.DoctorId,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Reason = a.Reason,
                    Notes = a.Notes,
                    ChairId = a.ChairId,
                    ChairName = a.Chair != null ? a.Chair.Name : null,
                    VisitId = a.Visit != null ? a.Visit.Id : (Guid?)null
                })
                .ToListAsync(cancellationToken);

            return Result<List<AppointmentDto>>.Success(appointments);
        }
    }
}
