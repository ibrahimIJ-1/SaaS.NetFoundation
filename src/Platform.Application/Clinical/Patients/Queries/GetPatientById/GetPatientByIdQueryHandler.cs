using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Application.Clinical.Patients.DTOs;
using Platform.Persistence;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Patients.Queries.GetPatientById
{
    public class GetPatientByIdQueryHandler : IRequestHandler<GetPatientByIdQuery, Result<PatientDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetPatientByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PatientDto>> Handle(GetPatientByIdQuery request, CancellationToken cancellationToken)
        {
            var patient = await _context.Patients
                .Where(p => p.Id == request.PatientId && p.IsActive)
                .Select(p => new PatientDto
                {
                    Id = p.Id,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    FullName = p.FullName,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender,
                    NationalId = p.NationalId,
                    PhoneNumber = p.PhoneNumber,
                    Email = p.Email,
                    Address = p.Address,
                    EmergencyContactName = p.EmergencyContactName,
                    EmergencyContactPhone = p.EmergencyContactPhone
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (patient == null)
            {
                return Result<PatientDto>.Failure("Patient not found.");
            }

            return Result<PatientDto>.Success(patient);
        }
    }
}
