using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Commands.CreateRole
{
    public class CreateRoleCommand : IRequest<Result>
    {
        public string Name { get; set; } = default!;
        public List<Guid> PermissionIds { get; set; } = new();
    }
}
