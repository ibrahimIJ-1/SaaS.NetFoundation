using Platform.Application.Abstractions;
using Platform.Application.Multitenancy;

namespace Platform.Infrastructure.MultiTenancy
{
    public class TenantProvider : ITenantProvider
    {
        public TenantInfo? CurrentTenant { get; private set; }

        public void SetTenant(TenantInfo tenant)
        {
            CurrentTenant = tenant;
        }
    }
}
