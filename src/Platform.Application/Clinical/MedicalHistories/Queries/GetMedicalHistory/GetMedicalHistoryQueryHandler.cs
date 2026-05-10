using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Application.Clinical.MedicalHistories.DTOs;
using Platform.Persistence;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.MedicalHistories.Queries.GetMedicalHistory
{
    public class GetMedicalHistoryQueryHandler : IRequestHandler<GetMedicalHistoryQuery, Result<MedicalHistoryDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetMedicalHistoryQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<MedicalHistoryDto>> Handle(GetMedicalHistoryQuery request, CancellationToken cancellationToken)
        {
            var history = await _context.MedicalHistories
                .Where(m => m.PatientId == request.PatientId)
                .Select(m => new MedicalHistoryDto
                {
                    PatientId = m.PatientId,
                    BloodType = m.BloodType,
                    Allergies = m.Allergies,
                    ChronicDiseases = m.ChronicDiseases,
                    CurrentMedications = m.CurrentMedications,
                    GeneralNotes = m.GeneralNotes
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (history == null)
            {
                return Result<MedicalHistoryDto>.Failure("Medical history not found.");
            }

            return Result<MedicalHistoryDto>.Success(history);
        }
    }
}
