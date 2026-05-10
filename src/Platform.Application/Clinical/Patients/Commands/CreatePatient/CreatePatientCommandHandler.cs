using MediatR;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Patients.Commands.CreatePatient
{
    public class CreatePatientCommandHandler : IRequestHandler<CreatePatientCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public CreatePatientCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(CreatePatientCommand request, CancellationToken cancellationToken)
        {
            var patient = new Patient(request.FirstName, request.LastName, request.DateOfBirth, request.Gender)
            {
                NationalId = request.NationalId,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                Address = request.Address,
                EmergencyContactName = request.EmergencyContactName,
                EmergencyContactPhone = request.EmergencyContactPhone
            };

            // Initialize empty clinical records
            patient.MedicalHistory = new MedicalHistory(patient.Id);
            patient.DentalChart = new DentalChart(patient.Id);

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(patient.Id);
        }
    }
}
