using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.TreatmentPlans.Queries.GetPatientTreatmentPlans
{
    public class TreatmentPlanItemDto
    {
        public Guid Id { get; set; }
        public string ProcedureName { get; set; } = default!;
        public string? Code { get; set; }
        public int? ToothNumber { get; set; }
        public string? Surface { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; } = default!;
        public DateTime? CompletionDate { get; set; }
    }

    public class TreatmentPlanDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = default!;
        public string Status { get; set; } = default!;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TreatmentPlanItemDto> Items { get; set; } = new();
        public decimal TotalCost => Items.Sum(i => i.Cost);
    }

    public class GetPatientTreatmentPlansQuery : IRequest<Result<List<TreatmentPlanDto>>>
    {
        public Guid PatientId { get; set; }
    }

    public class GetPatientTreatmentPlansQueryHandler : IRequestHandler<GetPatientTreatmentPlansQuery, Result<List<TreatmentPlanDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetPatientTreatmentPlansQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<TreatmentPlanDto>>> Handle(GetPatientTreatmentPlansQuery request, CancellationToken cancellationToken)
        {
            var plans = await _context.TreatmentPlans
                .Include(tp => tp.Items)
                .Where(tp => tp.PatientId == request.PatientId && tp.IsActive)
                .OrderByDescending(tp => tp.CreatedAt)
                .Select(tp => new TreatmentPlanDto
                {
                    Id = tp.Id,
                    Title = tp.Title,
                    Status = tp.Status.ToString(),
                    Notes = tp.Notes,
                    CreatedAt = tp.CreatedAt,
                    Items = tp.Items.Select(i => new TreatmentPlanItemDto
                    {
                        Id = i.Id,
                        ProcedureName = i.ProcedureName,
                        Code = i.Code,
                        ToothNumber = i.ToothNumber,
                        Surface = i.Surface,
                        Cost = i.Cost,
                        Status = i.Status.ToString(),
                        CompletionDate = i.CompletionDate
                    }).ToList()
                })
                .ToListAsync(cancellationToken);

            return Result<List<TreatmentPlanDto>>.Success(plans);
        }
    }
}
