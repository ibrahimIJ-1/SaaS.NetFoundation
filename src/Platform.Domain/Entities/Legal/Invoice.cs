using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platform.Domain.Entities.Legal
{
    public class Invoice : AuditableEntity
    {
        [Required]
        public string InvoiceNumber { get; set; } = default!;

        public Guid LegalCaseId { get; set; }
        public virtual LegalCase LegalCase { get; set; } = default!;

        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; }

        public InvoiceStatus Status { get; set; }
        public string? Notes { get; set; }

        public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    }

    public class InvoiceItem : AuditableEntity
    {
        public Guid InvoiceId { get; set; }
        public virtual Invoice Invoice { get; set; } = default!;

        [Required]
        public string Description { get; set; } = default!;

        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxRate { get; set; } // Percentage

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
    }

    public enum InvoiceStatus
    {
        Draft,
        Sent,
        Partial,
        Paid,
        Overdue,
        Cancelled
    }
}
