using Platform.Application.DTOs.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface IJournalService
    {
        Task<List<JournalEntryDto>> GetEntriesAsync(DateTime? from, DateTime? to, string? referenceType, Guid? referenceId);
        Task<List<TrialBalanceDto>> GetTrialBalanceAsync(DateTime? asOf);
        Task<BalanceSheetDto> GetBalanceSheetAsync(DateTime? asOf);
        Task<IncomeStatementDto> GetIncomeStatementAsync(DateTime from, DateTime to);
        Task<List<AccountsReceivableAgingDto>> GetAccountsReceivableAgingAsync(DateTime? asOf);
        Task<List<GeneralLedgerEntryDto>> GetGeneralLedgerAsync(Guid accountId, DateTime? from, DateTime? to);
    }
}
