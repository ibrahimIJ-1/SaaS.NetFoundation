using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;


namespace Platform.Application.Multitenancy.Users.Commands.CreateUser
{
    public class CreateUserCommandHandler
    : IRequestHandler<CreateUserCommand, Result>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public CreateUserCommandHandler(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<Result> Handle(
            CreateUserCommand request,
            CancellationToken cancellationToken)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
                return Result.Failure(result.Errors.Select(e => e.Description));

            if (!await _roleManager.RoleExistsAsync(request.Role))
                return Result.Failure("Role does not exist.");

            await _userManager.AddToRoleAsync(user, request.Role);

            return Result.Success();
        }
    }
}
