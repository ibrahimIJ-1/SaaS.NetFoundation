using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.Appointments.Commands.CreateAppointment;
using Platform.Application.Clinical.Appointments.Commands.DeleteAppointment;
using Platform.Application.Clinical.Appointments.Commands.Reschedule;
using Platform.Application.Clinical.Appointments.Commands.UpdateStatus;
using Platform.Application.Clinical.Appointments.Queries.GetAppointments;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/appointments")]
    [Authorize]
    public class TenantAppointmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TenantAppointmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize(Policy = "Permission.Appointments.View")]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] Guid? patientId, [FromQuery] string? doctorId)
        {
            var query = new GetAppointmentsQuery
            {
                StartDate = startDate,
                EndDate = endDate,
                PatientId = patientId,
                DoctorId = doctorId
            };
            var result = await _mediator.Send(query);
            return Ok(result.Data);
        }

        [HttpPost]
        [Authorize(Policy = "Permission.Appointments.Create")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "Permission.Appointments.Update")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAppointmentStatusCommand command)
        {
            command.AppointmentId = id;
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [HttpPut("{id}/reschedule")]
        [Authorize(Policy = "Permission.Appointments.Reschedule")]
        public async Task<IActionResult> Reschedule(Guid id, [FromBody] RescheduleAppointmentCommand command)
        {
            command.AppointmentId = id;
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Permission.Appointments.Delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteAppointmentCommand { AppointmentId = id });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }
    }
}
