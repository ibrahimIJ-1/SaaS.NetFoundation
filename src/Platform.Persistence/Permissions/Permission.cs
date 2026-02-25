using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence.Permissions
{
    public class Permission
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
    }
}
