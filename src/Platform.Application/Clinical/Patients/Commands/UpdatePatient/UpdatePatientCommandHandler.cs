using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Persistence;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Patients.Commands.UpdatePatient
{
    public class UpdatePatientCommandHandler : IRequestHandler<UpdatePatientCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public UpdatePatientCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(UpdatePatientCommand request, CancellationToken cancellationToken)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);

            if (patient == null)
                return Result.Failure("Patient not found.");

            patient.FirstName = request.FirstName;
            patient.LastName = request.LastName;
            patient.DateOfBirth = request.DateOfBirth;
            patient.Gender = request.Gender;
            patient.NationalId = request.NationalId;
            patient.PhoneNumber = request.PhoneNumber;
            patient.Email = request.Email;
            patient.Address = request.Address;
            patient.EmergencyContactName = request.EmergencyContactName;
            patient.EmergencyContactPhone = request.EmergencyContactPhone;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
