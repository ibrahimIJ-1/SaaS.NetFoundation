using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using Microsoft.EntityFrameworkCore;
using Platform.Persistence.Permissions;

namespace Platform.Application.Multitenancy.UserPermissionMatrix.Commands.SetUserRolesAndPermissions
{
    public class SetUserRolesAndPermissionsCommandHandler
    : IRequestHandler<SetUserRolesAndPermissionsCommand, Result>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TenantIdentityDbContext _db;

        public SetUserRolesAndPermissionsCommandHandler(
            UserManager<ApplicationUser> userManager,
            TenantIdentityDbContext db)
        {
            _userManager = userManager;
            _db = db;
        }

        public async Task<Result> Handle(
            SetUserRolesAndPermissionsCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
                return Result.Failure("User not found.");

            using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // 1️⃣ Get current roles
                var currentRoles = await _userManager.GetRolesAsync(user);

                // 2️⃣ Remove roles not in the request
                var rolesToRemove = currentRoles.Except(
                    await _db.Roles
                             .Where(r => request.RoleIds.Contains(r.Id))
                             .Select(r => r.Name)
                             .ToListAsync(cancellationToken)
                ).ToList();

                if (rolesToRemove.Any())
                    await _userManager.RemoveFromRolesAsync(user, rolesToRemove);

                // 3️⃣ Add new roles
                var rolesToAdd = await _db.Roles
                    .Where(r => request.RoleIds.Contains(r.Id) && !currentRoles.Contains(r.Name))
                    .Select(r => r.Name)
                    .ToListAsync(cancellationToken);

                if (rolesToAdd.Any())
                    await _userManager.AddToRolesAsync(user, rolesToAdd);

                // 4️⃣ Handle custom permissions
                // Remove old custom permissions
                var oldCustomPermissions = await _db.UserPermissions
                    .Where(up => up.UserId == user.Id)
                    .ToListAsync(cancellationToken);

                _db.UserPermissions.RemoveRange(oldCustomPermissions);
                var permissions = _db.Permissions.GetAsyncEnumerator();
                // Add new custom permissions
                var validCustomPermissions = await _db.Permissions
                    .Where(p => request.CustomPermissionIds.Contains(p.Id))
                    .ToListAsync(cancellationToken);

                foreach (var perm in validCustomPermissions)
                {
                    _db.UserPermissions.Add(new UserPermission
                    {
                        UserId = user.Id,
                        PermissionId = perm.Id
                    });
                }

                await _db.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure($"Failed to assign roles/permissions: {ex.Message}");
            }
        }
    }
}
