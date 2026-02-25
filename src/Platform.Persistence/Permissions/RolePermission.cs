using Microsoft.AspNetCore.Identity;

namespace Platform.Persistence.Permissions
{
    public class RolePermission
    {
        public string RoleId { get; set; } = default!;
        public IdentityRole Role { get; set; } = default!;

        public Guid PermissionId { get; set; }
        public Permission Permission { get; set; } = default!;
    }
}
