using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Roles.Commands.DeleteMultipleRoles
{
    public class DeleteMultipleRolesCommandHandler
    : IRequestHandler<DeleteMultipleRolesCommand, Result>
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TenantIdentityDbContext _db;

        public DeleteMultipleRolesCommandHandler(
            RoleManager<IdentityRole> roleManager,
            TenantIdentityDbContext db)
        {
            _roleManager = roleManager;
            _db = db;
        }

        public async Task<Result> Handle(DeleteMultipleRolesCommand request, CancellationToken cancellationToken)
        {
            foreach (var roleId in request.RoleIds)
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                    continue;

                var hasUsers = await _db.UserRoles
                    .AnyAsync(ur => ur.RoleId == role.Id, cancellationToken);

                if (hasUsers)
                    return Result.Failure($"Role {role.Name} is assigned to users.");

                var rolePermissions = _db.RolePermissions
                    .Where(rp => rp.RoleId == role.Id);

                _db.RolePermissions.RemoveRange(rolePermissions);

                var result = await _roleManager.DeleteAsync(role);
                if (!result.Succeeded)
                    return Result.Failure(result.Errors.Select(e => e.Description).ToList());
            }

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
