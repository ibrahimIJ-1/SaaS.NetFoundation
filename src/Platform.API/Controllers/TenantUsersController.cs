using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Multitenancy.Users.Commands.CreateUser;
using Platform.Application.Multitenancy.Users.Commands.DeleteUser;
using Platform.Application.Multitenancy.Users.Commands.UpdateUser;
using Platform.Application.Multitenancy.Users.Queries.GetAllUsers;
using Platform.Application.Multitenancy.Users.Queries.GetUserById;

namespace Platform.API.Controllers
{
    [Authorize(Roles = "Admin")]
    //[Authorize]
    [ApiController]
    [Route("api/tenant/users")]
    public class TenantUsersController : Controller
    {
        private readonly IMediator _mediator;

        public TenantUsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllUsersQuery());

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetById(string userId)
        {
            var result = await _mediator.Send(new GetUserByIdQuery
            {
                UserId = userId
            });

            if (!result.IsSuccess)
                return NotFound(result.Errors);

            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUserCommand command)
        {
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> Update(string userId, [FromBody] UpdateUserCommand command)
        {
            command.UserId = userId; // ensure the route ID is used
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            var command = new DeleteUserCommand { UserId = userId };
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }
    }
}
