using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Multitenancy.UserPermissionMatrix.Commands.SetUserRolesAndPermissions;
using Platform.Application.Multitenancy.UserPermissionMatrix.Queries.GetUserPermissionMatrix;
using Platform.Application.Multitenancy.Users.Commands.AssignRoles;
using Platform.Application.Multitenancy.Users.Commands.CreateUser;
using Platform.Application.Multitenancy.Users.Commands.DeleteUser;
using Platform.Application.Multitenancy.Users.Commands.UpdateUser;
using Platform.Application.Multitenancy.Users.Queries.GetAllUsers;
using Platform.Application.Multitenancy.Users.Queries.GetUserById;

namespace Platform.API.Controllers
{
    //[Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/tenant/users")]
    public class TenantUsersController : Controller
    {
        private readonly IMediator _mediator;

        public TenantUsersController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [Authorize(Policy = "Permission.Users.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllUsersQuery());

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }
        [Authorize(Policy = "Permission.Users.View")]
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

        [Authorize(Policy = "Permission.Users.Create")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateUserCommand command)
        {
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [Authorize(Policy = "Permission.Users.Update")]
        [HttpPut("{userId}")]
        public async Task<IActionResult> Update(string userId, [FromBody] UpdateUserCommand command)
        {
            command.UserId = userId; // ensure the route ID is used
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [Authorize(Policy = "Permission.Users.Delete")]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            var command = new DeleteUserCommand { UserId = userId };
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpPost("{userId}/roles")]
        public async Task<IActionResult> AssignRoles(string userId, [FromBody] List<string> roleIds)
        {
            var result = await _mediator.Send(new AssignRolesCommand
            {
                UserId = userId,
                RoleIds = roleIds
            });

            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }

        [HttpGet("permission-matrix")]
        public async Task<IActionResult> GetPermissionMatrix()
        {
            var result = await _mediator.Send(new GetUserPermissionMatrixQuery());
            return Ok(result);
        }

        [HttpPost("{userId}/roles-permissions")]
        public async Task<IActionResult> SetUserRolesAndPermissions(
    string userId,
    [FromBody] SetUserRolesAndPermissionsCommand command)
        {
            if (userId != command.UserId)
                return BadRequest("User ID mismatch.");

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok("Roles and permissions updated successfully.");
        }
    }
}
