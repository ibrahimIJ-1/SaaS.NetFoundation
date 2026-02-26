using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Multitenancy.Roles.Commands.AssignPermissionsToRole;
using Platform.Application.Multitenancy.Roles.Commands.CreateRole;
using Platform.Application.Multitenancy.Roles.Commands.DeleteMultipleRoles;
using Platform.Application.Multitenancy.Roles.Commands.DeleteRole;
using Platform.Application.Multitenancy.Roles.Commands.UpdateRole;
using Platform.Application.Multitenancy.Roles.Queries.GetAllRoles;
using Platform.Application.Multitenancy.Roles.Queries.GetRoleById;

namespace Platform.API.Controllers
{
    [Authorize]
    [Route("api/tenant/roles")]
    public class TenantRolesController : Controller
    {
        private readonly IMediator _mediator;

        public TenantRolesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllRolesQuery()));

        [HttpGet("{roleId}")]
        public async Task<IActionResult> GetById(string roleId)
            => Ok(await _mediator.Send(new GetRoleByIdQuery { RoleId = roleId }));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoleCommand command)
        {
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok("Role created with permissions successfully.");
        }

        [HttpPut("{roleId}")]
        public async Task<IActionResult> Update(
    string roleId,
    [FromBody] UpdateRoleCommand command)
        {
            command.RoleId = roleId;

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok("Role updated successfully.");
        }

        [HttpDelete("{roleId}")]
        public async Task<IActionResult> Delete(string roleId)
        {
            var result = await _mediator.Send(new DeleteRoleCommand { RoleId = roleId });
            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteMultiple([FromBody] DeleteMultipleRolesCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.IsSuccess)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpPost("{roleId}/permissions")]
        public async Task<IActionResult> AssignPermissions(string roleId, [FromBody] List<Guid> permissionIds)
        {
            var result = await _mediator.Send(new AssignPermissionsToRoleCommand
            {
                RoleId = roleId,
                PermissionIds = permissionIds
            });

            if (!result.IsSuccess) return BadRequest(result.Errors);
            return Ok();
        }
    }
}
