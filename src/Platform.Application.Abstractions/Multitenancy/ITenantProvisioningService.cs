namespace Platform.Application.Abstractions.Multitenancy
{
    public interface ITenantProvisioningService
    {
        Task RegisterTenantAsync(RegisterTenantRequest request);
    }
}
