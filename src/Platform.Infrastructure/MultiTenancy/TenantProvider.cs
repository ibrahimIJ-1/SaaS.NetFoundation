using Platform.Application.Abstractions;
using Platform.Application.Multitenancy;

namespace Platform.Infrastructure.MultiTenancy
{
    public class TenantProvider : ITenantProvider
    {
        private TenantInfo? _currentTenant;

        public TenantInfo? CurrentTenant => _currentTenant;

        public void SetTenant(TenantInfo tenant)
        {
            _currentTenant = tenant;
        }

        public string? GetConnectionString()
        {
            return _currentTenant?.ConnectionString;
        }
    }
}
