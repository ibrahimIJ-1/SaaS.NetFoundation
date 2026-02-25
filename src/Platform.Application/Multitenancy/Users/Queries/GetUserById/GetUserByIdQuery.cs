using MediatR;
using Platform.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Users.Queries.GetUserById
{
    public class GetUserByIdQuery : IRequest<Result<UserDto>>
    {
        public string UserId { get; set; } = default!;
    }

    public class UserDto
    {
        public string Id { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string? FullName { get; set; } = default!;
        public List<string> Roles { get; set; } = new();
    }
}
