using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.DTOs
{
    public class RoleWithPermissionsDto: RoleDto
    {
        public List<PermissionDto> Permissions { get; set; } = new();
    }

}
