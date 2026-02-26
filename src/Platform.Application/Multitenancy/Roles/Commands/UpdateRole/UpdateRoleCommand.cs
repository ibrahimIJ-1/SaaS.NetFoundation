using MediatR;
using Platform.Application.Common;

namespace Platform.Application.Multitenancy.Roles.Commands.UpdateRole
{
    public class UpdateRoleCommand : IRequest<Result>
    {
        public string RoleId { get; set; } = default!;
        public string Name { get; set; } = default!;
        public List<Guid> PermissionIds { get; set; } = new();
    }
}
