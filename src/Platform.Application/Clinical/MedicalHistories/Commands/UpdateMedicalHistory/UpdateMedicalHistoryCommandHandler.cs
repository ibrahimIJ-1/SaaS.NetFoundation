using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Persistence;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.MedicalHistories.Commands.UpdateMedicalHistory
{
    public class UpdateMedicalHistoryCommandHandler : IRequestHandler<UpdateMedicalHistoryCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public UpdateMedicalHistoryCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(UpdateMedicalHistoryCommand request, CancellationToken cancellationToken)
        {
            var history = await _context.MedicalHistories
                .FirstOrDefaultAsync(m => m.PatientId == request.PatientId, cancellationToken);

            if (history == null)
                return Result.Failure("Medical history not found.");

            history.BloodType = request.BloodType;
            history.Allergies = request.Allergies;
            history.ChronicDiseases = request.ChronicDiseases;
            history.CurrentMedications = request.CurrentMedications;
            history.GeneralNotes = request.GeneralNotes;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
