using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Multitenancy.Roles.Queries.GetAllRoles
{
    public class GetAllRolesQueryHandler
    : IRequestHandler<GetAllRolesQuery, List<RoleDto>>
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public GetAllRolesQueryHandler(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<List<RoleDto>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
        {
            return await _roleManager.Roles
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name!
                })
                .ToListAsync(cancellationToken);
        }
    }
}
