using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy
{
    public class TenantInfo
    {
        public string Id { get; init; } = default!;
        public string ConnectionString { get; init; } = default!;
    }
}
