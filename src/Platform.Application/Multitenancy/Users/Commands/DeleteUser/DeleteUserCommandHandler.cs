using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Users.Commands.DeleteUser
{
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public DeleteUserCommandHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
                return Result.Failure("User not found.");

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return Result.Failure(result.Errors.Select(e => e.Description).ToArray());

            return Result.Success();
        }
    }
}
