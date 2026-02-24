using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Persistence;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ITenantProvider _tenantProvider;

        public TestController(ITenantProvider tenantProvider)
        {
            _tenantProvider = tenantProvider;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var tenant = _tenantProvider.CurrentTenant
                         ?? throw new Exception("Tenant not resolved");

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString);

            using var db = new ApplicationDbContext(optionsBuilder.Options);

            // Test: list tables or just return tenant id
            return Ok(new { TenantId = tenant.Id, Message = "Tenant DB resolved!" });
        }
    }
}
