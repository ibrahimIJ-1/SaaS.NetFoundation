using System;
using System.Collections.Generic;
using System.Linq;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public enum InvoiceStatus
    {
        Draft,
        Unpaid,
        PartiallyPaid,
        Paid,
        Void
    }

    public enum PaymentMethod
    {
        Cash,
        Card,
        Insurance,
        BankTransfer
    }

    public class Invoice : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public Guid? VisitId { get; set; }
        public Visit? Visit { get; set; }

        public string InvoiceNumber { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal Balance => TotalAmount - PaidAmount;

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        public Invoice() { }

        public Invoice(Guid patientId, string invoiceNumber)
        {
            PatientId = patientId;
            InvoiceNumber = invoiceNumber;
            DueDate = DateTime.UtcNow.AddDays(30);
        }

        public void UpdateStatus()
        {
            if (PaidAmount <= 0) Status = InvoiceStatus.Unpaid;
            else if (PaidAmount < TotalAmount) Status = InvoiceStatus.PartiallyPaid;
            else Status = InvoiceStatus.Paid;
        }
    }

    public class InvoiceItem : BaseEntity
    {
        public Guid InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public string Description { get; set; } = default!;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal Total => Quantity * UnitPrice;

        public Guid? TreatmentPlanItemId { get; set; }
        public TreatmentPlanItem? TreatmentPlanItem { get; set; }

        public InvoiceItem() { }
    }

    public class Payment : BaseEntity
    {
        public Guid InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }

        public Payment() { }
    }
}
