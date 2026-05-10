using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Visits.Commands.UpdateVisitNotes
{
    public class UpdateVisitNotesCommand : IRequest<Result>
    {
        public Guid VisitId { get; set; }
        public string? Subjective { get; set; }
        public string? Objective { get; set; }
        public string? Assessment { get; set; }
        public string? Plan { get; set; }
    }

    public class UpdateVisitNotesCommandHandler : IRequestHandler<UpdateVisitNotesCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public UpdateVisitNotesCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(UpdateVisitNotesCommand request, CancellationToken cancellationToken)
        {
            var visit = await _context.Visits
                .FirstOrDefaultAsync(v => v.Id == request.VisitId, cancellationToken);

            if (visit == null)
                return Result.Failure("Visit not found.");

            if (visit.Status == VisitStatus.Completed)
                return Result.Failure("Cannot update notes of a completed visit.");

            visit.SubjectiveNotes = request.Subjective;
            visit.ObjectiveNotes = request.Objective;
            visit.Assessment = request.Assessment;
            visit.Plan = request.Plan;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
