using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy
{
    public interface ITenantProvisioningService
    {
        Task RegisterTenantAsync(RegisterTenantRequest request);
    }
}
