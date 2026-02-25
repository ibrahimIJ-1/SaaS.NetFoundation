using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Users.Commands.UpdateUser
{
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UpdateUserCommandHandler(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<Result> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
                return Result.Failure("User not found.");

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Email))
                user.Email = request.Email;
            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return Result.Failure(updateResult.Errors.Select(e => e.Description).ToArray());

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
                if (!passResult.Succeeded)
                    return Result.Failure(passResult.Errors.Select(e => e.Description).ToArray());
            }

            // Update role if provided
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (!await _roleManager.RoleExistsAsync(request.Role))
                    return Result.Failure("Role does not exist.");

                await _userManager.RemoveFromRolesAsync(user, roles);
                await _userManager.AddToRoleAsync(user, request.Role);
            }

            return Result.Success();
        }
    }
}
