using System;
using System.Collections.Generic;

namespace Platform.Application.DTOs.Accounting
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public string? InvoiceNumber { get; set; }
        public string? CaseTitle { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Method { get; set; } = default!;
        public string? ReferenceNumber { get; set; }
        public string? Notes { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? CurrencyCode { get; set; }
        public decimal ExchangeRate { get; set; }
    }

    public class RecordPaymentRequestDto
    {
        public Guid InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Method { get; set; } = default!;
        public string? ReferenceNumber { get; set; }
        public string? Notes { get; set; }
    }

    public class PaymentListDto
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public string? InvoiceNumber { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Method { get; set; } = default!;
        public string? ReferenceNumber { get; set; }
    }
}
