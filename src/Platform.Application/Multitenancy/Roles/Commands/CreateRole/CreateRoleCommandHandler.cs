using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using Platform.Persistence.Permissions;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Roles.Commands.CreateRole
{
    public class CreateRoleCommandHandler
    : IRequestHandler<CreateRoleCommand, Result>
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TenantIdentityDbContext _db;

        public CreateRoleCommandHandler(
            RoleManager<IdentityRole> roleManager,
            TenantIdentityDbContext db)
        {
            _roleManager = roleManager;
            _db = db;
        }

        public async Task<Result> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();
            // 1️⃣ Check if role exists
            try
            {
                var existingRole = await _roleManager.FindByNameAsync(request.Name);
                if (existingRole != null)
                    return Result.Failure("Role already exists.");

                // 2️⃣ Validate permissions exist
                var validPermissions = await _db.Permissions
                    .Where(p => request.PermissionIds.Contains(p.Id))
                    .Select(p => p.Id)
                    .ToListAsync(cancellationToken);

                if (validPermissions.Count != request.PermissionIds.Count)
                    return Result.Failure("One or more permissions are invalid.");

                // 3️⃣ Create role
                var role = new IdentityRole
                {
                    Name = request.Name,
                    NormalizedName = request.Name.ToUpper()
                };

                var createResult = await _roleManager.CreateAsync(role);

                if (!createResult.Succeeded)
                    return Result.Failure(createResult.Errors.Select(e => e.Description).ToList());

                // 4️⃣ Assign permissions
                foreach (var permissionId in validPermissions)
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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
