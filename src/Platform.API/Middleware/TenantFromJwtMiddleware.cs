using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Application.Multitenancy;
using Platform.Infrastructure.MultiTenancy;
using Platform.Persistence.Tenants;
using System.IdentityModel.Tokens.Jwt;

namespace Platform.API.Middleware
{
    public class TenantFromJwtMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantFromJwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider, TenantRegistryDbContext registryDb)
        {
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata.GetMetadata<SkipTenantResolutionAttribute>() != null)
            {
                await _next(context);
                return;
            }

            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var tenantIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "tenantId");
                if (tenantIdClaim != null)
                {
                    var tenant = await registryDb.Tenants.FirstOrDefaultAsync(t => t.Identifier == tenantIdClaim.Value);
                    if (tenant != null)
                    {
                        tenantProvider.SetTenant(new TenantInfo
                        {
                            Id = tenant.Identifier,
                            ConnectionString = tenant.ConnectionString
                        });
                    }
                }
            }

            await _next(context);
        }
    }
}
