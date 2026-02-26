using MediatR;
using Platform.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Permissions.Queries.GetAllPermissions
{
    public class GetAllPermissionsQuery : IRequest<List<PermissionDto>>
    {
    }
}
