using System;
using System.Collections.Generic;

namespace Platform.Application.DTOs.Accounting
{
    public class JournalEntryDto
    {
        public Guid Id { get; set; }
        public string EntryNumber { get; set; } = default!;
        public DateTime EntryDate { get; set; }
        public string Description { get; set; } = default!;
        public string Type { get; set; } = default!;
        public Guid? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }
        public bool IsPosted { get; set; }
        public List<JournalEntryLineDto> Lines { get; set; } = new();
    }

    public class JournalEntryLineDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = default!;
        public string AccountName { get; set; } = default!;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Description { get; set; }
        public decimal ExchangeRate { get; set; }
    }

    public class TrialBalanceDto
    {
        public string AccountCode { get; set; } = default!;
        public string AccountName { get; set; } = default!;
        public string AccountType { get; set; } = default!;
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal Balance { get; set; }
    }

    public class BalanceSheetDto
    {
        public List<BalanceSheetSection> Assets { get; set; } = new();
        public List<BalanceSheetSection> Liabilities { get; set; } = new();
        public List<BalanceSheetSection> Equity { get; set; } = new();
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
    }

    public class BalanceSheetSection
    {
        public string AccountCode { get; set; } = default!;
        public string AccountName { get; set; } = default!;
        public decimal Amount { get; set; }
    }

    public class IncomeStatementDto
    {
        public List<IncomeStatementLine> Revenues { get; set; } = new();
        public List<IncomeStatementLine> Expenses { get; set; } = new();
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
    }

    public class IncomeStatementLine
    {
        public string AccountCode { get; set; } = default!;
        public string AccountName { get; set; } = default!;
        public decimal Amount { get; set; }
    }

    public class AccountsReceivableAgingDto
    {
        public Guid InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = default!;
        public string? ClientName { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue { get; set; }
        public int DaysOverdue { get; set; }
        public string AgingBucket { get; set; } = default!;
    }

    public class GeneralLedgerEntryDto
    {
        public DateTime EntryDate { get; set; }
        public string EntryNumber { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string ReferenceType { get; set; } = default!;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal RunningBalance { get; set; }
    }
}
