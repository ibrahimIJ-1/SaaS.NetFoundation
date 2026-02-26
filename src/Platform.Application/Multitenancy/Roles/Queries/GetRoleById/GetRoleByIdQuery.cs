using MediatR;
using Platform.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Queries.GetRoleById
{
    public class GetRoleByIdQuery : IRequest<RoleWithPermissionsDto>
    {
        public string RoleId { get; set; } = default!;
    }
}
