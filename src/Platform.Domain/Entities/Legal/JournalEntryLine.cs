using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platform.Domain.Entities.Legal
{
    public class JournalEntryLine : BaseEntity
    {
        public Guid JournalEntryId { get; set; }
        public virtual JournalEntry JournalEntry { get; set; } = default!;

        public Guid AccountId { get; set; }
        public virtual Account Account { get; set; } = default!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Debit { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Credit { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ExchangeRate { get; set; } = 1.0m;
    }
}
