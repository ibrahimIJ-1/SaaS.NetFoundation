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
    [Route("api/invoices")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        public async Task<ActionResult<List<InvoiceListDto>>> GetInvoices()
        {
            return Ok(await _invoiceService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDto>> GetInvoice(Guid id)
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice == null) return NotFound();
            return Ok(invoice);
        }

        [HttpGet("case/{caseId}")]
        public async Task<ActionResult<List<InvoiceListDto>>> GetByCase(Guid caseId)
        {
            return Ok(await _invoiceService.GetByCaseAsync(caseId));
        }

        [HttpPost]
        public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceRequestDto request)
        {
            try
            {
                var invoice = await _invoiceService.CreateAsync(request);
                return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<InvoiceDto>> UpdateStatus(Guid id, [FromBody] UpdateInvoiceStatusDto request)
        {
            try
            {
                return Ok(await _invoiceService.UpdateStatusAsync(id, request));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("bulk-generate")]
        public async Task<ActionResult<BulkGenerateResultDto>> BulkGenerate([FromBody] BulkGenerateRequestDto request)
        {
            return Ok(await _invoiceService.BulkGenerateAsync(request));
        }

        [HttpGet("unbilled-summary")]
        public async Task<ActionResult<List<UnbilledSummaryDto>>> GetUnbilledSummary()
        {
            return Ok(await _invoiceService.GetUnbilledSummaryAsync());
        }

        [HttpGet("stats")]
        public async Task<ActionResult<InvoiceStatsDto>> GetStats()
        {
            return Ok(await _invoiceService.GetStatsAsync());
        }
    }
}
