using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Users.Commands.UpdateUser
{
    public class UpdateUserCommand : IRequest<Result>
    {
        public string UserId { get; set; } = default!;
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
    }
}
