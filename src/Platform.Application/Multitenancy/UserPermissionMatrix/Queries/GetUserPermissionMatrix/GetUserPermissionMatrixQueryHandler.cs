using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.DTOs;
using Platform.Persistence.Identity;

namespace Platform.Application.Multitenancy.UserPermissionMatrix.Queries.GetUserPermissionMatrix
{
    public class GetUserPermissionMatrixQueryHandler
        : IRequestHandler<GetUserPermissionMatrixQuery, List<UserPermissionMatrixDto>>
    {
        private readonly TenantIdentityDbContext _db;

        public GetUserPermissionMatrixQueryHandler(TenantIdentityDbContext db)
        {
            _db = db;
        }

        public async Task<List<UserPermissionMatrixDto>> Handle(
            GetUserPermissionMatrixQuery request,
            CancellationToken cancellationToken)
        {
            // 1️⃣ Load all users
            var users = await _db.Users
                .Select(u => new { u.Id, u.Email })
                .ToListAsync(cancellationToken);

            // 2️⃣ Load all roles
            var rolesDict = await _db.Roles
                .Select(r => new { r.Id, r.Name })
                .ToDictionaryAsync(r => r.Id, r => r.Name, cancellationToken);

            // 3️⃣ Load all user-role assignments
            var userRoles = await _db.UserRoles
                .Select(ur => new { ur.UserId, ur.RoleId })
                .ToListAsync(cancellationToken);

            // 4️⃣ Load all role-permission mappings
            var rolePermissions = await _db.RolePermissions
                .Join(_db.Permissions,
                      rp => rp.PermissionId,
                      p => p.Id,
                      (rp, p) => new { rp.RoleId, p.Name })
                .ToListAsync(cancellationToken);

            // 5️⃣ Load all user custom permissions
            var userCustomPermissions = await _db.UserPermissions
                .Join(_db.Permissions,
                      up => up.PermissionId,
                      p => p.Id,
                      (up, p) => new { up.UserId, p.Name })
                .ToListAsync(cancellationToken);

            // 6️⃣ Build lookups
            var rolePermissionsLookup = rolePermissions
                .GroupBy(rp => rp.RoleId)
                .ToDictionary(g => g.Key, g => g.Select(rp => rp.Name).ToHashSet());

            var userRolesLookup = userRoles
                .GroupBy(ur => ur.UserId)
                .ToDictionary(g => g.Key, g => g.Select(ur => ur.RoleId).ToList());

            var userCustomPermissionsLookup = userCustomPermissions
                .GroupBy(up => up.UserId)
                .ToDictionary(g => g.Key, g => g.Select(up => up.Name).ToHashSet());

            // 7️⃣ Map users → roles → permissions
            var result = users.Select(u =>
            {
                var assignedRoleIds = userRolesLookup.ContainsKey(u.Id)
                    ? userRolesLookup[u.Id]
                    : new List<string>();

                var assignedRoleNames = assignedRoleIds
                    .Where(rid => rolesDict.ContainsKey(rid))
                    .Select(rid => rolesDict[rid])
                    .ToList();

                var rolePermissionsSet = assignedRoleIds
                    .Where(rid => rolePermissionsLookup.ContainsKey(rid))
                    .SelectMany(rid => rolePermissionsLookup[rid]);

                var customPermissionsSet = userCustomPermissionsLookup.ContainsKey(u.Id)
                    ? userCustomPermissionsLookup[u.Id]
                    : Enumerable.Empty<string>();

                var allPermissions = rolePermissionsSet
                    .Concat(customPermissionsSet)
                    .Distinct()
                    .ToList();

                return new UserPermissionMatrixDto
                {
                    UserId = u.Id,
                    Email = u.Email!,
                    Roles = assignedRoleNames,
                    Permissions = allPermissions
                };
            }).ToList();

            return result;
        }
    }
}