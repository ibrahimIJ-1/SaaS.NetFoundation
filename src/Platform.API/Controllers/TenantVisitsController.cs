using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.Visits.Commands.CompleteVisit;
using Platform.Application.Clinical.Visits.Commands.StartVisit;
using Platform.Application.Clinical.Visits.Commands.UpdateVisitNotes;
using Platform.Application.Clinical.Visits.Queries.GetPatientVisits;
using Platform.Application.Clinical.Visits.Queries.GetVisitById;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/visits")]
    [Authorize]
    public class TenantVisitsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TenantVisitsController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Permission.Visits.View")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetVisitByIdQuery { VisitId = id });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Policy = "Permission.Visits.View")]
        public async Task<IActionResult> GetByPatient(Guid patientId)
        {
            var result = await _mediator.Send(new GetPatientVisitsQuery { PatientId = patientId });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPost("start")]
        [Authorize(Policy = "Permission.Visits.Create")]
        public async Task<IActionResult> Start([FromBody] StartVisitCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPut("{id}/notes")]
        [Authorize(Policy = "Permission.Visits.Update")]
        public async Task<IActionResult> UpdateNotes(Guid id, [FromBody] UpdateVisitNotesCommand command)
        {
            command.VisitId = id;
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [HttpPut("{id}/complete")]
        [Authorize(Policy = "Permission.Visits.Update")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var result = await _mediator.Send(new CompleteVisitCommand { VisitId = id });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }
    }
}
