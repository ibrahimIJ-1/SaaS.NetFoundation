using Platform.Application.DTOs.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface IPaymentService
    {
        Task<List<PaymentListDto>> GetAllAsync();
        Task<List<PaymentListDto>> GetByInvoiceAsync(Guid invoiceId);
        Task<List<PaymentListDto>> GetRecentAsync(int count = 10);
        Task<PaymentDto> RecordPaymentAsync(RecordPaymentRequestDto request);
        Task DeletePaymentAsync(Guid id);
    }
}
