
namespace Platform.Application.DTOs
{
    public class UserPermissionMatrixDto
    {
        public string UserId { get; set; } = default!;
        public string Email { get; set; } = default!;
        public List<string> Roles { get; set; } = new();
        public List<string> Permissions { get; set; } = new();
    }
}
