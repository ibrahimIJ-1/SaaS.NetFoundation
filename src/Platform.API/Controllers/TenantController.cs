using Microsoft.AspNetCore.Mvc;
using Platform.Application.Multitenancy;
using Platform.Infrastructure.MultiTenancy;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/tenants")]
    [SkipTenantResolution]
    public class TenantController : ControllerBase
    {
        private readonly ITenantProvisioningService _service;

        public TenantController(ITenantProvisioningService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterTenantRequest request)
        {
            await _service.RegisterTenantAsync(request);
            return Ok("Tenant created successfully");
        }
    }
}
