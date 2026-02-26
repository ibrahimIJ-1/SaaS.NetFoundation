using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Users.Commands.AssignRoles
{
    public class AssignRolesCommand : IRequest<Result>
    {
        public string UserId { get; set; } = default!;
        public List<string> RoleIds { get; set; } = new();
    }
}
