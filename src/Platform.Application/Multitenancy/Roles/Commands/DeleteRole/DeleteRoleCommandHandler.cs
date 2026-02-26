using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Roles.Commands.DeleteRole
{
    public class DeleteRoleCommandHandler
    : IRequestHandler<DeleteRoleCommand, Result>
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TenantIdentityDbContext _db;

        public DeleteRoleCommandHandler(
            RoleManager<IdentityRole> roleManager,
            TenantIdentityDbContext db)
        {
            _roleManager = roleManager;
            _db = db;
        }

        public async Task<Result> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.RoleId);
            if (role == null)
                return Result.Failure("Role not found.");

            var hasUsers = await _db.UserRoles
                .AnyAsync(ur => ur.RoleId == role.Id, cancellationToken);

            if (hasUsers)
                return Result.Failure("Role is assigned to users and cannot be deleted.");

            var rolePermissions = _db.RolePermissions
                .Where(rp => rp.RoleId == role.Id);

            _db.RolePermissions.RemoveRange(rolePermissions);

            var result = await _roleManager.DeleteAsync(role);

            if (!result.Succeeded)
                return Result.Failure(result.Errors.Select(e => e.Description).ToList());

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
