using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Platform.Application.Multitenancy;
using Platform.Domain.Entities;
using Platform.Domain.Tenants;
using Platform.Persistence;
using Platform.Persistence.Identity;
using Platform.Persistence.Permissions;
using Platform.Persistence.Tenants;
using Platform.Shared;

namespace Platform.Infrastructure.MultiTenancy
{
    public class TenantProvisioningService : ITenantProvisioningService
    {
        private readonly TenantRegistryDbContext _registryContext;
        private readonly IConfiguration _configuration;

        public TenantProvisioningService(
            TenantRegistryDbContext registryContext,
            IConfiguration configuration)
        {
            _registryContext = registryContext;
            _configuration = configuration;
        }

        public async Task RegisterTenantAsync(RegisterTenantRequest request)
        {
            var tenantConnectionString = await SaveTenantAsync(request);
            
            // 1. Migrate Identity Context
            await using var identityDb = CreateTenantDb(tenantConnectionString);
            await identityDb.Database.MigrateAsync();

            // 2. Migrate Application Context
            var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(tenantConnectionString)
                .Options;
            await using var appDb = new ApplicationDbContext(appOptions);
            await appDb.Database.MigrateAsync();

            // 3. Seed everything
            await SeedTenantAsync(identityDb, tenantConnectionString, request.AdminEmail, request.AdminPassword);
        }

        public async Task EnsureTenantSeedsAsync(string connectionString)
        {
            await using var tenantDb = CreateTenantDb(connectionString);

            // Ensure permissions exist
            var existingPermissionNames = await tenantDb.Permissions
                .Select(p => p.Name)
                .ToListAsync();

            var missingPermissions = PermissionDefinitions.All
                .Where(p => !existingPermissionNames.Contains(p))
                .Select(p => new Permission { Id = Guid.NewGuid(), Name = p })
                .ToList();

            if (missingPermissions.Count > 0)
            {
                await tenantDb.Permissions.AddRangeAsync(missingPermissions);
                await tenantDb.SaveChangesAsync();
            }

            // Ensure default roles exist
            var roleStore = new RoleStore<IdentityRole>(tenantDb);
            var roleManager = new RoleManager<IdentityRole>(roleStore, null, null, null, null);

            foreach (var roleName in PermissionDefinitions.DefaultRolePermissions.Keys.Append("Admin").Append("User"))
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                    await roleManager.CreateAsync(new IdentityRole(roleName));
            }

            // Ensure Admin role has all permissions
            var adminRole = await roleManager.FindByNameAsync("Admin");
            var allPermissions = await tenantDb.Permissions.ToListAsync();
            var existingAdminPermissions = await tenantDb.RolePermissions
                .Where(rp => rp.RoleId == adminRole.Id)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            foreach (var permission in allPermissions)
            {
                if (!existingAdminPermissions.Contains(permission.Id))
                {
                    tenantDb.RolePermissions.Add(new RolePermission
                    {
                        RoleId = adminRole.Id,
                        PermissionId = permission.Id,
                    });
                }
            }

            // Ensure default roles have their assigned permissions
            var permissionDict = await tenantDb.Permissions.ToDictionaryAsync(p => p.Name, p => p.Id);

            foreach (var (roleName, permNames) in PermissionDefinitions.DefaultRolePermissions)
            {
                var role = await roleManager.FindByNameAsync(roleName);
                if (role == null) continue;

                var existingRolePermissions = await tenantDb.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .Select(rp => rp.PermissionId)
                    .ToHashSetAsync();

                foreach (var permName in permNames)
                {
                    if (permissionDict.TryGetValue(permName, out var permId) && !existingRolePermissions.Contains(permId))
                    {
                        tenantDb.RolePermissions.Add(new RolePermission
                        {
                            RoleId = role.Id,
                            PermissionId = permId,
                        });
                    }
                }
            }

            await tenantDb.SaveChangesAsync();

            // Ensure feature flags exist
            var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(connectionString)
                .Options;

            await using var appDb = new ApplicationDbContext(appOptions);
            var existingFeatures = await appDb.TenantFeatures.Select(f => f.FeatureKey).ToListAsync();
            var missingFeatures = FeatureFlags.All
                .Where(f => !existingFeatures.Contains(f))
                .Select(f => new TenantFeature
                {
                    FeatureKey = f,
                    IsEnabled = true,
                    Description = $"Enable/disable the {f} module"
                }).ToList();

            if (missingFeatures.Count > 0)
            {
                await appDb.TenantFeatures.AddRangeAsync(missingFeatures);
                await appDb.SaveChangesAsync();
            }
        }

        private async Task<string> SaveTenantAsync(RegisterTenantRequest request)
        {
            var baseConnection = _configuration.GetConnectionString("TenantTemplate");
            var tenantDbName = $"Tenant_{request.Identifier}";
            var tenantConnectionString = baseConnection.Replace("{DB_NAME}", tenantDbName);

            var tenant = new Tenant
            {
                Name = request.Name,
                Identifier = request.Identifier,
                ConnectionString = tenantConnectionString,
                IsActive = true
            };

            _registryContext.Tenants.Add(tenant);
            await _registryContext.SaveChangesAsync();
            return tenantConnectionString;
        }

        private TenantIdentityDbContext CreateTenantDb(string connectionString)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TenantIdentityDbContext>();
            optionsBuilder.UseSqlServer(connectionString);
            return new TenantIdentityDbContext(optionsBuilder.Options);
        }

        private async Task SeedTenantAsync(TenantIdentityDbContext tenantDb, string tenantConnectionString, string adminEmail, string adminPassword)
        {
            var roleStore = new RoleStore<IdentityRole>(tenantDb);
            var roleManager = new RoleManager<IdentityRole>(roleStore, null, null, null, null);

            // Seed roles
            await roleManager.CreateAsync(new IdentityRole("Admin"));
            await roleManager.CreateAsync(new IdentityRole("User"));
            foreach (var roleName in PermissionDefinitions.DefaultRolePermissions.Keys)
                await roleManager.CreateAsync(new IdentityRole(roleName));

            // Seed permissions
            var permissions = PermissionDefinitions.All
                .Select(p => new Permission { Id = Guid.NewGuid(), Name = p })
                .ToList();

            await tenantDb.Permissions.AddRangeAsync(permissions);
            await tenantDb.SaveChangesAsync();

            var permissionDict = permissions.ToDictionary(p => p.Name, p => p.Id);

            // Assign all permissions to Admin role
            var adminRole = await roleManager.FindByNameAsync("Admin");
            foreach (var permission in permissions)
            {
                tenantDb.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id,
                });
            }

            // Assign role-specific permissions
            foreach (var (roleName, permNames) in PermissionDefinitions.DefaultRolePermissions)
            {
                var role = await roleManager.FindByNameAsync(roleName);
                if (role == null) continue;

                foreach (var permName in permNames)
                {
                    if (permissionDict.TryGetValue(permName, out var permId))
                    {
                        tenantDb.RolePermissions.Add(new RolePermission
                        {
                            RoleId = role.Id,
                            PermissionId = permId,
                        });
                    }
                }
            }

            await tenantDb.SaveChangesAsync();

            // Seed feature flags
            var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(tenantConnectionString)
                .Options;

            await using var appDb = new ApplicationDbContext(appOptions);
            // Migrations moved to RegisterTenantAsync

            //var features = FeatureFlags.All
            //    .Select(f => new TenantFeature
            //    {
            //        FeatureKey = f,
            //        IsEnabled = true,
            //        Description = $"Enable/disable the {f} module"
            //    }).ToList();

            //await appDb.TenantFeatures.AddRangeAsync(features);
            await appDb.SaveChangesAsync();

            // Create admin user
            var userStore = new UserStore<ApplicationUser>(tenantDb);
            var userManager = new UserManager<ApplicationUser>(
                userStore, null, new PasswordHasher<ApplicationUser>(),
                null, null, null, null, null, null);

            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                IsActive = true,
            };

            await userManager.CreateAsync(admin, adminPassword);
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
