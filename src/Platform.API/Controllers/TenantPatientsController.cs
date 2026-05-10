using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.Patients.Commands.CreatePatient;
using Platform.Application.Clinical.Patients.Commands.UpdatePatient;
using Platform.Application.Clinical.Patients.Commands.DeletePatient;
using Platform.Application.Clinical.Patients.Queries.GetAllPatients;
using Platform.Application.Clinical.Patients.Queries.GetPatientById;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/patients")]
    public class TenantPatientsController : Controller
    {
        private readonly IMediator _mediator;

        public TenantPatientsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize(Policy = "Permission.Patients.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllPatientsQuery());
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Patients.View")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetPatientByIdQuery { PatientId = id });
            if (!result.IsSuccess) return NotFound(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Patients.Create")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePatientCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Patients.Update")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientCommand command)
        {
            command.PatientId = id;
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [Authorize(Policy = "Permission.Patients.Delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeletePatientCommand { PatientId = id });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }
    }
}
