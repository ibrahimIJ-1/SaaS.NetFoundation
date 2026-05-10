using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentCommand : IRequest<Result>
    {
        public Guid AppointmentId { get; set; }
    }

    public class DeleteAppointmentCommandHandler : IRequestHandler<DeleteAppointmentCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public DeleteAppointmentCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(DeleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result.Failure("Appointment not found.");

            appointment.IsActive = false;
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
