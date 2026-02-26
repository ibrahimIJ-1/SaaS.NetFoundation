using MediatR;
using Platform.Application.Common;
using Platform.Persistence.Identity;
using Platform.Persistence.Permissions;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.Roles.Commands.AssignPermissionsToRole
{
    public class AssignPermissionsToRoleCommandHandler
    : IRequestHandler<AssignPermissionsToRoleCommand, Result>
    {
        private readonly TenantIdentityDbContext _db;

        public AssignPermissionsToRoleCommandHandler(TenantIdentityDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(AssignPermissionsToRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await _db.Roles.FindAsync(request.RoleId);
            if (role == null) return Result.Failure("Role not found.");

            // Remove old permissions not included in the request
            var current = _db.RolePermissions.Where(rp => rp.RoleId == request.RoleId);
            _db.RolePermissions.RemoveRange(current);

            // Add new permissions
            foreach (var pid in request.PermissionIds)
            {
                _db.RolePermissions.Add(new RolePermission
                {
                    RoleId = request.RoleId,
                    PermissionId = pid
                });
            }

            await _db.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
