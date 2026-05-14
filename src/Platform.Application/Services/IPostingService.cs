using System;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface IPostingService
    {
        Task PostInvoiceCreatedAsync(Guid invoiceId);
        Task PostPaymentRecordedAsync(Guid paymentId);
        Task PostExpenseRecordedAsync(Guid expenseId);
        Task PostTrustTransactionAsync(Guid trustTransactionId);
        Task PostInvoiceCancelledAsync(Guid invoiceId);
        Task PostInvoiceStatusChangedAsync(Guid invoiceId, string oldStatus, string newStatus);
    }
}
