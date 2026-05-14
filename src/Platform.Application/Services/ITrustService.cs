using Platform.Application.DTOs.Accounting;
using System;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface ITrustService
    {
        Task<TrustTransactionsResponseDto> GetByCaseAsync(Guid caseId);
        Task<List<TrustTransactionDto>> GetAllAsync();
        Task<TrustTransactionDto> RecordTransactionAsync(RecordTrustRequestDto request);
    }
}
