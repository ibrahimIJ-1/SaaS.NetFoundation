using Microsoft.AspNetCore.Authorization;
using Platform.Application.Common.Security;
using Platform.Persistence.Identity;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public class PermissionAuthorizationHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly TenantIdentityDbContext _dbContext;

    public PermissionAuthorizationHandler(TenantIdentityDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            context.Fail();
            return;
        }

        var permissions = await _dbContext.UserPermissions
            .Where(up => up.UserId == userId)
            .Select(up => up.Permission.Name)
            .Union(
                _dbContext.UserRoles
                    .Where(ur => ur.UserId == userId)
                    .Join(_dbContext.RolePermissions, ur => ur.RoleId, rp => rp.RoleId, (ur, rp) => rp.Permission.Name)
            )
            .ToListAsync();

        if (permissions.Contains(requirement.Permission))
            context.Succeed(requirement);
        else
            context.Fail();
    }
}