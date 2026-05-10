using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentCommand : IRequest<Result<Guid>>
    {
        public Guid PatientId { get; set; }
        public string DoctorId { get; set; } = default!;
        public Guid? ChairId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public CreateAppointmentCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            // Validate time
            if (request.StartTime >= request.EndTime)
                return Result<Guid>.Failure("Start time must be before end time.");

            // 1. Doctor Overlap Check
            var doctorConflict = await _context.Appointments
                .AnyAsync(a => a.DoctorId == request.DoctorId &&
                               a.IsActive &&
                               a.Status != AppointmentStatus.Cancelled &&
                               a.StartTime < request.EndTime &&
                               a.EndTime > request.StartTime, cancellationToken);
            
            if (doctorConflict)
                return Result<Guid>.Failure("Doctor has another appointment at this time.");

            // 2. Chair Overlap Check
            if (request.ChairId.HasValue)
            {
                var chairConflict = await _context.Appointments
                    .AnyAsync(a => a.ChairId == request.ChairId &&
                                   a.IsActive &&
                                   a.Status != AppointmentStatus.Cancelled &&
                                   a.StartTime < request.EndTime &&
                                   a.EndTime > request.StartTime, cancellationToken);
                
                if (chairConflict)
                    return Result<Guid>.Failure("Chair is already occupied at this time.");
            }
            
            var appointment = new Appointment(
                request.PatientId,
                request.DoctorId,
                request.StartTime,
                request.EndTime,
                request.Reason)
            {
                ChairId = request.ChairId,
                Notes = request.Notes
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(appointment.Id);
        }
    }
}
