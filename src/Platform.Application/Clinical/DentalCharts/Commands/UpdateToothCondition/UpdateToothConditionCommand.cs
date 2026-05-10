using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;

namespace Platform.Application.Clinical.DentalCharts.Commands.UpdateToothCondition
{
    public record UpdateToothConditionCommand(
        Guid PatientId,
        int ToothNumber,
        ToothStatus Status,
        string? Notes
    ) : IRequest<Result>;

    public class UpdateToothConditionCommandHandler : IRequestHandler<UpdateToothConditionCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public UpdateToothConditionCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(UpdateToothConditionCommand request, CancellationToken cancellationToken)
        {
            var chart = await _context.DentalCharts
                .Include(c => c.ToothConditions)
                .FirstOrDefaultAsync(c => c.PatientId == request.PatientId, cancellationToken);

            if (chart == null)
            {
                chart = new DentalChart(request.PatientId);
                _context.DentalCharts.Add(chart);
            }

            var condition = chart.ToothConditions.FirstOrDefault(tc => tc.ToothNumber == request.ToothNumber);

            if (condition == null)
            {
                condition = new ToothCondition(chart.Id, request.ToothNumber, request.Status);
                condition.Notes = request.Notes;
                chart.ToothConditions.Add(condition);
            }
            else
            {
                condition.Status = request.Status;
                condition.Notes = request.Notes;
            }

            chart.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
