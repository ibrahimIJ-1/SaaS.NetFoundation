using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;

namespace Platform.Application.Clinical.Inventory.Commands.AdjustStock
{
    public record AdjustStockCommand(Guid InventoryItemId, int Quantity, TransactionType Type, string? Notes) : IRequest<Result>;

    public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, Result>
    {
        private readonly ApplicationDbContext _context;

        public AdjustStockCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result> Handle(AdjustStockCommand request, CancellationToken cancellationToken)
        {
            var item = await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.Id == request.InventoryItemId, cancellationToken);

            if (item == null)
                return Result.Failure("Inventory item not found.");

            var transaction = new StockTransaction
            {
                InventoryItemId = item.Id,
                Quantity = request.Quantity,
                Type = request.Type,
                Notes = request.Notes,
                TransactionDate = DateTime.UtcNow
            };

            // Update stock based on type
            switch (request.Type)
            {
                case TransactionType.StockIn:
                    item.CurrentStock += request.Quantity;
                    break;
                case TransactionType.StockOut:
                case TransactionType.Consumption:
                    item.CurrentStock -= request.Quantity;
                    break;
                case TransactionType.Adjustment:
                    item.CurrentStock = request.Quantity; // Overwrite for manual adjustment
                    break;
            }

            _context.StockTransactions.Add(transaction);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
