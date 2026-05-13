using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _dbContext.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i.LegalCase)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(payments);
        }

        public PaymentsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("invoice/{invoiceId}")]
        public async Task<IActionResult> GetByInvoice(Guid invoiceId)
        {
            var payments = await _dbContext.Payments
                .Where(p => p.InvoiceId == invoiceId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(payments);
        }

        [HttpPost]
        public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentRequest request)
        {
            var invoice = await _dbContext.Invoices.FindAsync(request.InvoiceId);
            if (invoice == null) return NotFound("Invoice not found.");

            var payment = new Payment
            {
                InvoiceId = request.InvoiceId,
                Amount = request.Amount,
                PaymentDate = request.PaymentDate,
                Method = request.Method,
                ReferenceNumber = request.ReferenceNumber,
                Notes = request.Notes
            };

            _dbContext.Payments.Add(payment);

            // Update Invoice Paid Amount
            invoice.PaidAmount += payment.Amount;

            // Update Status automatically
            if (invoice.PaidAmount >= invoice.TotalAmount)
            {
                invoice.Status = InvoiceStatus.Paid;
            }
            else if (invoice.PaidAmount > 0)
            {
                invoice.Status = InvoiceStatus.Partial;
            }

            await _dbContext.SaveChangesAsync();

            return Ok(payment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(Guid id)
        {
            var payment = await _dbContext.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            var invoice = await _dbContext.Invoices.FindAsync(payment.InvoiceId);
            if (invoice != null)
            {
                invoice.PaidAmount -= payment.Amount;
                
                // Revert status if necessary
                if (invoice.PaidAmount <= 0)
                {
                    invoice.Status = InvoiceStatus.Sent; // Or Draft depending on workflow
                }
                else if (invoice.PaidAmount < invoice.TotalAmount)
                {
                    invoice.Status = InvoiceStatus.Partial;
                }
            }

            _dbContext.Payments.Remove(payment);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }

    public class RecordPaymentRequest
    {
        public Guid InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMethod Method { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Notes { get; set; }
    }
}
