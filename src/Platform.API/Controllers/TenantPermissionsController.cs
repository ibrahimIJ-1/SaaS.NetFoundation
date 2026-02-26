using MediatR;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.Multitenancy.Permissions.Queries.GetAllPermissions;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenant/permissions")]
    public class TenantPermissionsController : Controller
    {
        private readonly IMediator _mediator;

        public TenantPermissionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _mediator.Send(new GetAllPermissionsQuery()));
    }
}
