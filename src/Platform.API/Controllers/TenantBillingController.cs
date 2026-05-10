using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.Billing.Commands.RecordPayment;
using Platform.Application.Clinical.Billing.Queries.GetPatientLedger;
using Platform.Application.Clinical.Billing.Queries.GetBillingSummary;
using Platform.Application.Clinical.Billing.Queries.GetInvoices;
using Platform.Application.Clinical.Billing.Commands.CreateInvoice;
using Platform.Application.Clinical.Billing.Commands.GenerateFromTreatmentPlan;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/billing")]
    [Authorize]
    public class TenantBillingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TenantBillingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("summary")]
        [Authorize(Policy = "Permission.Billing.View")]
        public async Task<IActionResult> GetSummary()
        {
            var result = await _mediator.Send(new GetBillingSummaryQuery());
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpGet("invoices")]
        [Authorize(Policy = "Permission.Billing.View")]
        public async Task<IActionResult> GetInvoices([FromQuery] GetInvoicesQuery query)
        {
            var result = await _mediator.Send(query);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPost("invoices")]
        [Authorize(Policy = "Permission.Billing.Create")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpGet("patient/{patientId}/ledger")]
        [Authorize(Policy = "Permission.Billing.View")]
        public async Task<IActionResult> GetLedger(Guid patientId)
        {
            var result = await _mediator.Send(new GetPatientLedgerQuery { PatientId = patientId });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPost("payments")]
        [Authorize(Policy = "Permission.Billing.Create")]
        public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [HttpPost("generate-from-treatment-plan")]
        [Authorize(Policy = "Permission.Billing.Create")]
        public async Task<IActionResult> GenerateFromTreatmentPlan([FromBody] GenerateFromTreatmentPlanCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }
    }
}
