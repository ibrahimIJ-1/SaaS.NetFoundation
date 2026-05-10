using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.TreatmentPlans.Commands.CreateTreatmentPlan;
using Platform.Application.Clinical.TreatmentPlans.Commands.UpdateProcedureStatus;
using Platform.Application.Clinical.TreatmentPlans.Queries.GetPatientTreatmentPlans;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/treatment-plans")]
    [Authorize]
    public class TenantTreatmentPlansController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TenantTreatmentPlansController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Policy = "Permission.TreatmentPlans.View")]
        public async Task<IActionResult> GetByPatient(Guid patientId)
        {
            var result = await _mediator.Send(new GetPatientTreatmentPlansQuery { PatientId = patientId });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPost]
        [Authorize(Policy = "Permission.TreatmentPlans.Create")]
        public async Task<IActionResult> Create([FromBody] CreateTreatmentPlanCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPut("items/{itemId}/status")]
        [Authorize(Policy = "Permission.TreatmentPlans.Update")]
        public async Task<IActionResult> UpdateItemStatus(Guid itemId, [FromBody] UpdateProcedureStatusCommand command)
        {
            command.ProcedureId = itemId;
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }
    }
}
