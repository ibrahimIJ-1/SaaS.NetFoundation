using System.ComponentModel.DataAnnotations;
using System;
using Platform.Domain.Common;

namespace Platform.Domain.Entities.Legal
{
    public class Expense : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public virtual LegalCase LegalCase { get; set; } = default!;

        [Required] public string Description { get; set; } = default!;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        [Required] public string Category { get; set; } = default!; // e.g., Court Fees, Travel, Printing
        public bool IsBilled { get; set; }
        public Guid? InvoiceId { get; set; }
        
        public string? ReceiptUrl { get; set; }
        public string CreatedBy { get; set; } = default!;
    }
}
