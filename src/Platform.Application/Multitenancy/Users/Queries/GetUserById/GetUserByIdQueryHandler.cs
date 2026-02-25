using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Users.Queries.GetUserById
{
    public class GetUserByIdQueryHandler
        : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Result<UserDto>> Handle(
            GetUserByIdQuery request,
            CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user == null)
                return Result<UserDto>.Failure("User not found.");

            var roles = await _userManager.GetRolesAsync(user);

            var dto = new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
                Roles = roles.ToList()
            };

            return Result<UserDto>.Success(dto);
        }
    }
}
