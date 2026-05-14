using System;
using System.Collections.Generic;

namespace Platform.Application.DTOs.Accounting
{
    public class InvoiceDto
    {
        public Guid Id { get; set; }
        public string InvoiceNumber { get; set; } = default!;
        public Guid LegalCaseId { get; set; }
        public string? CaseTitle { get; set; }
        public string? CaseNumber { get; set; }
        public string? ClientName { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue => TotalAmount - PaidAmount;
        public string Status { get; set; } = default!;
        public string? Notes { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? CurrencyCode { get; set; }
        public decimal ExchangeRate { get; set; }
        public DateTime CreatedOn { get; set; }
        public List<InvoiceItemDto> Items { get; set; } = new();
    }

    public class InvoiceItemDto
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = default!;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; }
        public decimal Total { get; set; }
    }

    public class CreateInvoiceRequestDto
    {
        public string InvoiceNumber { get; set; } = default!;
        public Guid LegalCaseId { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public string? Notes { get; set; }
        public Guid? CurrencyId { get; set; }
        public List<CreateInvoiceItemDto> Items { get; set; } = new();
    }

    public class CreateInvoiceItemDto
    {
        public string Description { get; set; } = default!;
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; }
    }

    public class UpdateInvoiceStatusDto
    {
        public string Status { get; set; } = default!;
    }

    public class InvoiceListDto
    {
        public Guid Id { get; set; }
        public string InvoiceNumber { get; set; } = default!;
        public string? CaseTitle { get; set; }
        public string? CaseNumber { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue => TotalAmount - PaidAmount;
        public string Status { get; set; } = default!;
        public Guid? CurrencyId { get; set; }
        public decimal ExchangeRate { get; set; }
    }

    public class InvoiceStatsDto
    {
        public decimal TotalInvoiced { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal TrustBalance { get; set; }
    }

    public class BulkGenerateRequestDto
    {
        public List<Guid> CaseIds { get; set; } = new();
        public Guid? CurrencyId { get; set; }
    }

    public class BulkGenerateResultDto
    {
        public int Count { get; set; }
    }

    public class UnbilledSummaryDto
    {
        public Guid CaseId { get; set; }
        public string CaseTitle { get; set; } = default!;
        public string CaseNumber { get; set; } = default!;
        public decimal UnbilledAmount { get; set; }
        public int UnbilledCount { get; set; }
    }
}
