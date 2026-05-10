using System;
using System.Collections.Generic;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class InventoryCategory : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        
        public ICollection<InventoryItem> Items { get; set; } = new List<InventoryItem>();
    }

    public class InventoryItem : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string? SKU { get; set; }
        public string? Description { get; set; }
        
        public Guid CategoryId { get; set; }
        public InventoryCategory Category { get; set; } = null!;

        public decimal UnitPrice { get; set; }
        public int CurrentStock { get; set; }
        public int MinimumStockThreshold { get; set; }
        public string? UnitOfMeasure { get; set; } // e.g., Box, Unit, ml
        
        public bool IsLowStock => CurrentStock <= MinimumStockThreshold;

        public ICollection<StockTransaction> Transactions { get; set; } = new List<StockTransaction>();
    }

    public enum TransactionType
    {
        StockIn,
        StockOut,
        Adjustment,
        Consumption
    }

    public class StockTransaction : BaseEntity
    {
        public Guid InventoryItemId { get; set; }
        public InventoryItem InventoryItem { get; set; } = null!;

        public int Quantity { get; set; }
        public TransactionType Type { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        
        public string? ReferenceNumber { get; set; } // e.g., Invoice # or Visit ID
        public string? Notes { get; set; }
        
        public Guid? PerformedByUserId { get; set; }
    }
}
