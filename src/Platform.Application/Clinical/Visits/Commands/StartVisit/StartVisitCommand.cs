using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Visits.Commands.StartVisit
{
    public class StartVisitCommand : IRequest<Result<Guid>>
    {
        public Guid AppointmentId { get; set; }
    }

    public class StartVisitCommandHandler : IRequestHandler<StartVisitCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public StartVisitCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(StartVisitCommand request, CancellationToken cancellationToken)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Visit)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result<Guid>.Failure("Appointment not found.");

            if (appointment.Visit != null)
                return Result<Guid>.Success(appointment.Visit.Id); // Already started

            // Create new visit
            var visit = new Visit(appointment.PatientId, appointment.DoctorId, appointment.Id)
            {
                ChiefComplaint = appointment.Reason,
                Status = VisitStatus.Active,
                Date = DateTime.UtcNow
            };

            // Update appointment status
            appointment.Status = AppointmentStatus.InProgress;

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(visit.Id);
        }
    }
}
