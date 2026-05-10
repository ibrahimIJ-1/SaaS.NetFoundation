using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.DentalCharts.Commands.UpdateToothCondition;
using Platform.Application.Clinical.DentalCharts.Queries.GetDentalChart;
using Platform.Application.Clinical.DentalCharts.Queries.GetToothHistory;
using Platform.Application.Clinical.MedicalHistories.Commands.UpdateMedicalHistory;
using Platform.Application.Clinical.MedicalHistories.Queries.GetMedicalHistory;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/patients/{patientId}/clinical")]
    public class TenantClinicalController : Controller
    {
        private readonly IMediator _mediator;

        public TenantClinicalController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // --- Medical History ---

        [Authorize(Policy = "Permission.Patients.ViewMedicalHistory")]
        [HttpGet("medical-history")]
        public async Task<IActionResult> GetMedicalHistory(Guid patientId)
        {
            var result = await _mediator.Send(new GetMedicalHistoryQuery { PatientId = patientId });
            if (!result.IsSuccess) return NotFound(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Patients.EditMedicalHistory")]
        [HttpPut("medical-history")]
        public async Task<IActionResult> UpdateMedicalHistory(Guid patientId, [FromBody] UpdateMedicalHistoryCommand command)
        {
            command.PatientId = patientId;
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        // --- Dental Chart (Odontogram) ---

        [Authorize(Policy = "Permission.Clinical.ViewDentalChart")]
        [HttpGet("dental-chart")]
        public async Task<IActionResult> GetDentalChart(Guid patientId)
        {
            var result = await _mediator.Send(new GetDentalChartQuery(patientId));
            if (!result.IsSuccess) return NotFound(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Clinical.EditDentalChart")]
        [HttpPut("dental-chart/tooth")]
        public async Task<IActionResult> UpdateToothCondition(Guid patientId, [FromBody] UpdateToothConditionCommand command)
        {
            var result = await _mediator.Send(command with { PatientId = patientId });
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [Authorize(Policy = "Permission.Clinical.ViewDentalChart")]
        [HttpGet("dental-chart/tooth/{toothNumber}/history")]
        public async Task<IActionResult> GetToothHistory(Guid patientId, int toothNumber)
        {
            var result = await _mediator.Send(new GetToothHistoryQuery(patientId, toothNumber));
            if (!result.IsSuccess) return NotFound(result.Errors);
            return Ok(result.Data);
        }
    }
}
