using Platform.Application.Multitenancy;

namespace Platform.Application.Abstractions
{
    public interface ITenantProvider
    {
        TenantInfo? CurrentTenant { get; }
        void SetTenant(TenantInfo tenant);
    }
}
