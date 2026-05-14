using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platform.Domain.Entities.Legal
{
    public class Payment : AuditableEntity
    {
        public Guid InvoiceId { get; set; }
        public virtual Invoice Invoice { get; set; } = default!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public Guid? CurrencyId { get; set; }
        public virtual Currency? Currency { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ExchangeRate { get; set; } = 1.0m;

        public DateTime PaymentDate { get; set; }

        public PaymentMethod Method { get; set; }

        public string? ReferenceNumber { get; set; } // Check #, Transaction ID, etc.
        public string? Notes { get; set; }
    }

    public enum PaymentMethod
    {
        Cash,
        BankTransfer,
        Check,
        CreditCard,
        Online,
        Other
    }
}
