using MediatR;
using Platform.Application.DTOs;
using Platform.Persistence.Identity;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Permissions.Queries.GetAllPermissions
{
    public class GetAllPermissionsQueryHandler
    : IRequestHandler<GetAllPermissionsQuery, List<PermissionDto>>
    {
        private readonly TenantIdentityDbContext _db;

        public GetAllPermissionsQueryHandler(TenantIdentityDbContext db)
        {
            _db = db;
        }

        public async Task<List<PermissionDto>> Handle(
            GetAllPermissionsQuery request,
            CancellationToken cancellationToken)
        {
            return await _db.Permissions
                .OrderBy(p => p.Name)
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name
                })
                .ToListAsync(cancellationToken);
        }
    }
}
