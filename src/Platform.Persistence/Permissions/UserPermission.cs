using Platform.Persistence.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence.Permissions
{
    public class UserPermission
    {
        public string UserId { get; set; } = default!;
        public ApplicationUser User { get; set; } = default!;

        public Guid PermissionId { get; set; }
        public Permission Permission { get; set; } = default!;
    }
}
