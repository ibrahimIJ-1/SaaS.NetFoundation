using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Abstractions.Multitenancy
{
    public class RegisterTenantRequest
    {
        public string Name { get; set; } = default!;
        public string Identifier { get; set; } = default!;
        public string AdminEmail { get; set; } = default!;
        public string AdminPassword { get; set; } = default!;
    }
}
