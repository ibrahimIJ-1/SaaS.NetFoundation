using MediatR;
using Microsoft.AspNetCore.Identity;
using Platform.Application.DTOs;
using Platform.Persistence.Identity;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Roles.Queries.GetRoleById
{
    public class GetRoleByIdQueryHandler
    : IRequestHandler<GetRoleByIdQuery, RoleWithPermissionsDto?>
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TenantIdentityDbContext _db;

        public GetRoleByIdQueryHandler(
            RoleManager<IdentityRole> roleManager,
            TenantIdentityDbContext db)
        {
            _roleManager = roleManager;
            _db = db;
        }

        public async Task<RoleWithPermissionsDto?> Handle(
            GetRoleByIdQuery request,
            CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.RoleId);
            if (role == null)
                return null;

            var permissions = await _db.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Include(rp => rp.Permission)
                .Select(rp => new PermissionDto
                {
                    Id = rp.PermissionId,
                    Name = rp.Permission.Name
                })
                .ToListAsync(cancellationToken);

            return new RoleWithPermissionsDto
            {
                Id = role.Id,
                Name = role.Name!,
                Permissions = permissions
            };
        }
    }
}
