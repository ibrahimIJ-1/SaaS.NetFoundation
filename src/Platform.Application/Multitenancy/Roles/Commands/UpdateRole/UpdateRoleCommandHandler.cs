using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using Platform.Persistence.Permissions;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Roles.Commands.UpdateRole
{
    public class UpdateRoleCommandHandler
    : IRequestHandler<UpdateRoleCommand, Result>
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TenantIdentityDbContext _db;

        public UpdateRoleCommandHandler(
            RoleManager<IdentityRole> roleManager,
            TenantIdentityDbContext db)
        {
            _roleManager = roleManager;
            _db = db;
        }

        public async Task<Result> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.RoleId);
            if (role == null)
                return Result.Failure("Role not found.");

            using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // 1️⃣ Update role name if changed
                if (!string.Equals(role.Name, request.Name, StringComparison.OrdinalIgnoreCase))
                {
                    role.Name = request.Name;
                    role.NormalizedName = request.Name.ToUpper();

                    var updateResult = await _roleManager.UpdateAsync(role);
                    if (!updateResult.Succeeded)
                        return Result.Failure(updateResult.Errors.Select(e => e.Description).ToList());
                }

                // 2️⃣ Validate permissions
                var validPermissions = await _db.Permissions
                    .Where(p => request.PermissionIds.Contains(p.Id))
                    .Select(p => p.Id)
                    .ToListAsync(cancellationToken);

                if (validPermissions.Count != request.PermissionIds.Count)
                    return Result.Failure("One or more permissions are invalid.");

                // 3️⃣ Get existing role permissions
                var existingRolePermissions = await _db.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .ToListAsync(cancellationToken);

                // 4️⃣ Remove permissions not included anymore
                var toRemove = existingRolePermissions
                    .Where(rp => !validPermissions.Contains(rp.PermissionId))
                    .ToList();

                _db.RolePermissions.RemoveRange(toRemove);

                // 5️⃣ Add new permissions
                var existingPermissionIds = existingRolePermissions
                    .Select(rp => rp.PermissionId)
                    .ToList();

                var toAdd = validPermissions
                    .Where(pid => !existingPermissionIds.Contains(pid))
                    .ToList();

                foreach (var permissionId in toAdd)
                {
                    _db.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permissionId
                    });
                }

                await _db.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Success();
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
