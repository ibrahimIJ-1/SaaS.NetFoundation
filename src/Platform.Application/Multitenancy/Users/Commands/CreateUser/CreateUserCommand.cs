using MediatR;
using Platform.Application.Common;

namespace Platform.Application.Multitenancy.Users.Commands.CreateUser
{
    public class CreateUserCommand : IRequest<Result>
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
    }
}
