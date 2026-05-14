using Platform.Application.DTOs.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface IInvoiceService
    {
        Task<List<InvoiceListDto>> GetAllAsync();
        Task<InvoiceDto?> GetByIdAsync(Guid id);
        Task<List<InvoiceListDto>> GetByCaseAsync(Guid caseId);
        Task<InvoiceDto> CreateAsync(CreateInvoiceRequestDto request);
        Task<InvoiceDto> UpdateStatusAsync(Guid id, UpdateInvoiceStatusDto request);
        Task<BulkGenerateResultDto> BulkGenerateAsync(BulkGenerateRequestDto request);
        Task<InvoiceStatsDto> GetStatsAsync();
        Task<List<UnbilledSummaryDto>> GetUnbilledSummaryAsync();
    }
}
