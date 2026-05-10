using MediatR;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.TreatmentPlans.Commands.CreateTreatmentPlan
{
    public class CreateTreatmentPlanItemDto
    {
        public string ProcedureName { get; set; } = default!;
        public string? Code { get; set; }
        public int? ToothNumber { get; set; }
        public string? Surface { get; set; }
        public decimal Cost { get; set; }
    }

    public class CreateTreatmentPlanCommand : IRequest<Result<Guid>>
    {
        public Guid PatientId { get; set; }
        public string DoctorId { get; set; } = default!;
        public string Title { get; set; } = "Untitled Plan";
        public string? Notes { get; set; }
        public List<CreateTreatmentPlanItemDto> Items { get; set; } = new();
    }

    public class CreateTreatmentPlanCommandHandler : IRequestHandler<CreateTreatmentPlanCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public CreateTreatmentPlanCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(CreateTreatmentPlanCommand request, CancellationToken cancellationToken)
        {
            var plan = new TreatmentPlan(request.PatientId, request.DoctorId, request.Title)
            {
                Notes = request.Notes,
                Status = TreatmentPlanStatus.Active // Default to Active when created via UI usually
            };

            foreach (var itemDto in request.Items)
            {
                plan.Items.Add(new TreatmentPlanItem
                {
                    ProcedureName = itemDto.ProcedureName,
                    Code = itemDto.Code,
                    ToothNumber = itemDto.ToothNumber,
                    Surface = itemDto.Surface,
                    Cost = itemDto.Cost,
                    Status = ProcedureStatus.Proposed
                });
            }

            _context.TreatmentPlans.Add(plan);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(plan.Id);
        }
    }
}
