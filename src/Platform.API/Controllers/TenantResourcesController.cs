using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Clinical.Resources.Commands.CreateChair;
using Platform.Application.Clinical.Resources.Commands.CreateRoom;
using Platform.Application.Clinical.Resources.Queries.GetResources;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/resources")]
    public class TenantResourcesController : Controller
    {
        private readonly IMediator _mediator;

        public TenantResourcesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize(Policy = "Permission.Resources.View")]
        [HttpGet]
        public async Task<IActionResult> GetResources()
        {
            var result = await _mediator.Send(new GetResourcesQuery());
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Resources.Manage")]
        [HttpPost("rooms")]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }

        [Authorize(Policy = "Permission.Resources.Manage")]
        [HttpPost("chairs")]
        public async Task<IActionResult> CreateChair([FromBody] CreateChairCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok(result.Data);
        }
    }
}
