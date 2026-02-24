using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Application.Multitenancy;
using Platform.Infrastructure.MultiTenancy;
using Platform.Persistence.Tenants;


namespace Platform.API.Middleware
{
    public class TenantResolutionMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolutionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider, TenantRegistryDbContext registryDb)
        {
            var endpoint = context.GetEndpoint();

            // 🚀 Check if endpoint has SkipTenantResolution attribute
            if (endpoint?.Metadata.GetMetadata<SkipTenantResolutionAttribute>() != null)
            {
                await _next(context);
                return;
            }

            var tenantId = context.Request.Headers["X-Tenant-ID"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(tenantId))
                throw new Exception("Tenant header missing");

            var tenant = await registryDb.Tenants.FirstOrDefaultAsync(t => t.Identifier == tenantId);

            if (tenant == null || !tenant.IsActive)
                throw new Exception("Invalid tenant");

            tenantProvider.SetTenant(new TenantInfo
            {
                Id = tenant.Identifier,
                ConnectionString = tenant.ConnectionString
            });

            await _next(context);
        }
    }
}
