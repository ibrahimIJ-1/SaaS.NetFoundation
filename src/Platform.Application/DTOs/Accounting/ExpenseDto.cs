using System;

namespace Platform.Application.DTOs.Accounting
{
    public class ExpenseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string Category { get; set; } = default!;
        public string? ReceiptUrl { get; set; }
        public Guid? LegalCaseId { get; set; }
        public string? CaseTitle { get; set; }
        public bool IsBilled { get; set; }
        public Guid? InvoiceId { get; set; }
        public Guid? CurrencyId { get; set; }
        public decimal ExchangeRate { get; set; }
    }

    public class CreateExpenseRequestDto
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string Category { get; set; } = default!;
        public string? ReceiptUrl { get; set; }
        public Guid? LegalCaseId { get; set; }
        public Guid? CurrencyId { get; set; }
    }
}
