using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;

namespace Platform.Application.Clinical.DentalCharts.Queries.GetDentalChart
{
    public record GetDentalChartQuery(Guid PatientId) : IRequest<Result<DentalChartDto>>;

    public class DentalChartDto
    {
        public Guid PatientId { get; set; }
        public List<ToothConditionDto> Teeth { get; set; } = new();
    }

    public class ToothConditionDto
    {
        public int ToothNumber { get; set; }
        public string Status { get; set; } = default!;
        public string? Notes { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class GetDentalChartQueryHandler : IRequestHandler<GetDentalChartQuery, Result<DentalChartDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetDentalChartQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<DentalChartDto>> Handle(GetDentalChartQuery request, CancellationToken cancellationToken)
        {
            var chart = await _context.DentalCharts
                .Include(c => c.ToothConditions)
                .FirstOrDefaultAsync(c => c.PatientId == request.PatientId, cancellationToken);

            if (chart == null)
            {
                // Initialize chart if it doesn't exist
                chart = new DentalChart(request.PatientId);
                _context.DentalCharts.Add(chart);
                await _context.SaveChangesAsync(cancellationToken);
            }

            var dto = new DentalChartDto
            {
                PatientId = chart.PatientId,
                Teeth = chart.ToothConditions.Select(tc => new ToothConditionDto
                {
                    ToothNumber = tc.ToothNumber,
                    Status = tc.Status.ToString(),
                    Notes = tc.Notes,
                    LastUpdated = chart.LastUpdated
                }).ToList()
            };

            return Result<DentalChartDto>.Success(dto);
        }
    }
}
