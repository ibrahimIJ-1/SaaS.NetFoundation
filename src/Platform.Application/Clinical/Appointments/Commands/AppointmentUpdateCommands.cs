using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Appointments.Commands.UpdateStatus
{
    public class UpdateAppointmentStatusCommand : IRequest<Result>
    {
        public Guid AppointmentId { get; set; }
        public AppointmentStatus NewStatus { get; set; }
    }

    public class UpdateAppointmentStatusHandler : IRequestHandler<UpdateAppointmentStatusCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public UpdateAppointmentStatusHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(UpdateAppointmentStatusCommand request, CancellationToken cancellationToken)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result.Failure("Appointment not found.");

            appointment.Status = request.NewStatus;
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}

namespace Platform.Application.Clinical.Appointments.Commands.Reschedule
{
    public class RescheduleAppointmentCommand : IRequest<Result>
    {
        public Guid AppointmentId { get; set; }
        public DateTime NewStartTime { get; set; }
        public DateTime NewEndTime { get; set; }
    }

    public class RescheduleAppointmentHandler : IRequestHandler<RescheduleAppointmentCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public RescheduleAppointmentHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(RescheduleAppointmentCommand request, CancellationToken cancellationToken)
        {
            if (request.NewStartTime >= request.NewEndTime)
                return Result.Failure("Start time must be before end time.");

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result.Failure("Appointment not found.");

            appointment.StartTime = request.NewStartTime;
            appointment.EndTime = request.NewEndTime;
            
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
