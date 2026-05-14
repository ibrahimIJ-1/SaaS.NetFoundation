using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.DTOs.Accounting;
using Platform.Application.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PaymentListDto>>> GetAll()
        {
            return Ok(await _paymentService.GetAllAsync());
        }

        [HttpGet("invoice/{invoiceId}")]
        public async Task<ActionResult<List<PaymentListDto>>> GetByInvoice(Guid invoiceId)
        {
            return Ok(await _paymentService.GetByInvoiceAsync(invoiceId));
        }

        [HttpGet("recent")]
        public async Task<ActionResult<List<PaymentListDto>>> GetRecent()
        {
            return Ok(await _paymentService.GetRecentAsync(10));
        }

        [HttpPost]
        public async Task<ActionResult<PaymentDto>> RecordPayment([FromBody] RecordPaymentRequestDto request)
        {
            try
            {
                return Ok(await _paymentService.RecordPaymentAsync(request));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(Guid id)
        {
            try
            {
                await _paymentService.DeletePaymentAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
