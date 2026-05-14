using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platform.Domain.Entities.Legal
{
    public enum JournalEntryType
    {
        Invoice,
        Payment,
        Expense,
        Trust,
        Adjustment,
        CreditNote
    }

    public class JournalEntry : AuditableEntity
    {
        [Required, MaxLength(50)]
        public string EntryNumber { get; set; } = default!;

        public DateTime EntryDate { get; set; }

        [Required, MaxLength(500)]
        public string Description { get; set; } = default!;

        public JournalEntryType Type { get; set; }

        public Guid? ReferenceId { get; set; }
        [MaxLength(50)]
        public string? ReferenceType { get; set; }

        public bool IsPosted { get; set; } = true;

        public virtual ICollection<JournalEntryLine> Lines { get; set; } = new List<JournalEntryLine>();
    }
}
