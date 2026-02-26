using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Commands.AssignPermissionsToRole
{
    public class AssignPermissionsToRoleCommand : IRequest<Result>
    {
        public string RoleId { get; set; } = default!;
        public List<Guid> PermissionIds { get; set; } = new();
    }
}
