using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.UserPermissionMatrix.Commands.SetUserRolesAndPermissions
{
    public class SetUserRolesAndPermissionsCommand : IRequest<Result>
    {
        public string UserId { get; set; } = default!;

        /// <summary>
        /// Roles to assign to the user (completely replace old roles)
        /// </summary>
        public List<string> RoleIds { get; set; } = new();

        /// <summary>
        /// Additional custom permissions (not included in roles)
        /// </summary>
        public List<Guid> CustomPermissionIds { get; set; } = new();
    }
}
