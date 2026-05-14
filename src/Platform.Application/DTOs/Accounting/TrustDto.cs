using System;
using System.Collections.Generic;

namespace Platform.Application.DTOs.Accounting
{
    public class TrustTransactionDto
    {
        public Guid Id { get; set; }
        public Guid LegalCaseId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = default!;
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = default!;
        public string? ReferenceNumber { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? CurrencyCode { get; set; }
        public decimal ExchangeRate { get; set; }
    }

    public class TrustTransactionsResponseDto
    {
        public List<TrustTransactionDto> Transactions { get; set; } = new();
        public decimal Balance { get; set; }
    }

    public class RecordTrustRequestDto
    {
        public Guid LegalCaseId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = default!;
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = default!;
        public string? ReferenceNumber { get; set; }
        public Guid? CurrencyId { get; set; }
    }
}
