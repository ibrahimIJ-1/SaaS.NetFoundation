using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Commands.DeleteMultipleRoles
{
    public class DeleteMultipleRolesCommand : IRequest<Result>
    {
        public List<string> RoleIds { get; set; } = new();
    }
}
