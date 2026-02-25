using MediatR;
using Platform.Application.Common;


namespace Platform.Application.Multitenancy.Users.Queries.GetAllUsers
{
    public class GetAllUsersQuery : IRequest<Result<List<UserDto>>>
    {
    }

    public class UserDto
    {
        public string Id { get; set; } = default!;
        public string Email { get; set; } = default!;
        public List<string> Roles { get; set; } = new();
    }
}
