using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Application.Multitenancy;
using Platform.Persistence.Tenants;

namespace Platform.Infrastructure.MultiTenancy
{
    public class TenantProvider : ITenantProvider
    {
        private TenantInfo? _currentTenant;
        private readonly TenantRegistryDbContext _registryDb;
        public TenantProvider(TenantRegistryDbContext registryDb)
        {
            _registryDb = registryDb;
        }

        public TenantInfo? CurrentTenant => _currentTenant;

        

        public void SetTenant(TenantInfo tenant)
        {
            _currentTenant = tenant;
        }

        public string? GetConnectionString()
        {
            return _currentTenant?.ConnectionString;
        }

        public async Task SetTenantByIdAsync(string tenantId)
        {
            var tenant = await _registryDb.Tenants
                .Where(t => t.Id.ToString() == tenantId && t.IsActive)
                .Select(t => new TenantInfo
                {
                    Id = t.Id.ToString(),
                    ConnectionString = t.ConnectionString
                })
                .FirstOrDefaultAsync();

            if (tenant == null)
                throw new Exception($"Tenant '{tenantId}' not found");

            _currentTenant = tenant;
        }
    }
}
