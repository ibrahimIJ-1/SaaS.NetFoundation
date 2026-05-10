using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Application.Clinical.Patients.DTOs;
using Platform.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Patients.Queries.GetAllPatients
{
    public class GetAllPatientsQueryHandler : IRequestHandler<GetAllPatientsQuery, Result<List<PatientDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetAllPatientsQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<PatientDto>>> Handle(GetAllPatientsQuery request, CancellationToken cancellationToken)
        {
            var patients = await _context.Patients
                .Where(p => p.IsActive)
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
                .ToListAsync(cancellationToken);

            return Result<List<PatientDto>>.Success(patients);
        }
    }
}
