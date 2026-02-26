using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Queries.GetAllRoles
{
    public class GetAllRolesQuery : IRequest<List<RoleDto>>
    {
    }

    public class RoleDto
    {
        public string Id { get; set; } = default!;
        public string Name { get; set; } = default!;
    }
}
