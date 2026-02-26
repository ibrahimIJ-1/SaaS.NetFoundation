using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Commands.DeleteRole
{
    public class DeleteRoleCommand : IRequest<Result>
    {
        public string RoleId { get; set; } = default!;
    }
}
