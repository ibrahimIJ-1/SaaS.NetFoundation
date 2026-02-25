using MediatR;
using Platform.Application.Common;

namespace Platform.Application.Multitenancy.Users.Commands.DeleteUser
{
    public class DeleteUserCommand : IRequest<Result>
    {
        public string UserId { get; set; } = default!;
    }
}
