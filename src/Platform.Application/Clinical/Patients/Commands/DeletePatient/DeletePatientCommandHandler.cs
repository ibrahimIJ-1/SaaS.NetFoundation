using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Persistence;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Patients.Commands.DeletePatient
{
    public class DeletePatientCommandHandler : IRequestHandler<DeletePatientCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public DeletePatientCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(DeletePatientCommand request, CancellationToken cancellationToken)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);

            if (patient == null)
            {
                return Result.Failure("Patient not found.");
            }

            // Soft delete by setting IsActive to false
            patient.IsActive = false;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
