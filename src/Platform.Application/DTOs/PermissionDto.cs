using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.DTOs
{
    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
    }
}
