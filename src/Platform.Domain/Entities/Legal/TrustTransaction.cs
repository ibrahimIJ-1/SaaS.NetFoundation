using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platform.Domain.Entities.Legal
{
    public class TrustTransaction : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public virtual LegalCase LegalCase { get; set; } = default!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public Guid? CurrencyId { get; set; }
        public virtual Currency? Currency { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ExchangeRate { get; set; } = 1.0m;

        public TrustTransactionType Type { get; set; }

        public DateTime TransactionDate { get; set; }

        [Required]
        public string Description { get; set; } = default!;

        public string? ReferenceNumber { get; set; }
    }

    public enum TrustTransactionType
    {
        Deposit,
        Withdrawal
    }
}
