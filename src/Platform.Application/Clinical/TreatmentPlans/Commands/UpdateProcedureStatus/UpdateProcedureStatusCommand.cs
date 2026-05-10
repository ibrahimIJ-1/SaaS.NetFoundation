using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.TreatmentPlans.Commands.UpdateProcedureStatus
{
    public class UpdateProcedureStatusCommand : IRequest<Result>
    {
        public Guid ProcedureId { get; set; }
        public ProcedureStatus Status { get; set; }
        public Guid? VisitId { get; set; }
    }

    public class UpdateProcedureStatusCommandHandler : IRequestHandler<UpdateProcedureStatusCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public UpdateProcedureStatusCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(UpdateProcedureStatusCommand request, CancellationToken cancellationToken)
        {
            var item = await _context.TreatmentPlanItems
                .FirstOrDefaultAsync(i => i.Id == request.ProcedureId, cancellationToken);

            if (item == null)
                return Result.Failure("Procedure not found.");

            item.Status = request.Status;
            
            if (request.Status == ProcedureStatus.Completed)
            {
                item.CompletionDate = DateTime.UtcNow;
                if (request.VisitId.HasValue)
                {
                    item.PerformedInVisitId = request.VisitId.Value;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
