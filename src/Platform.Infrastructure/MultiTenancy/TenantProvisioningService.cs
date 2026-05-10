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
            // 1️⃣ Build connection string
            var baseConnection = _configuration.GetConnectionString("TenantTemplate");

            var tenantDbName = $"Tenant_{request.Identifier}";
            var tenantConnectionString = baseConnection.Replace("{DB_NAME}", tenantDbName);

            // 2️⃣ Save tenant in master DB
            var tenant = new Tenant
            {
                Name = request.Name,
                Identifier = request.Identifier,
                ConnectionString = tenantConnectionString,
                IsActive = true
            };

            _registryContext.Tenants.Add(tenant);
            await _registryContext.SaveChangesAsync();

            // 3️⃣ Create tenant DB context dynamically
            var optionsBuilder = new DbContextOptionsBuilder<TenantIdentityDbContext>();
            optionsBuilder.UseSqlServer(tenantConnectionString);

            using var tenantDb = new TenantIdentityDbContext(optionsBuilder.Options);

            // 4️⃣ Create database + apply migrations
            await tenantDb.Database.MigrateAsync();

            // 5️⃣ Seed roles
            var roleStore = new RoleStore<IdentityRole>(tenantDb);
            var roleManager = new RoleManager<IdentityRole>(
                roleStore,
                null,
                null,
                null,
                null);

            await roleManager.CreateAsync(new IdentityRole("Admin"));
            await roleManager.CreateAsync(new IdentityRole("Doctor"));
            await roleManager.CreateAsync(new IdentityRole("Receptionist"));
            await roleManager.CreateAsync(new IdentityRole("Accountant"));
            await roleManager.CreateAsync(new IdentityRole("Nurse"));
            await roleManager.CreateAsync(new IdentityRole("InventoryManager"));
            await roleManager.CreateAsync(new IdentityRole("BranchManager"));
            await roleManager.CreateAsync(new IdentityRole("User"));

            // 6️⃣ Seed permissions
            var permissions = PermissionDefinitions.All
                .Select(p => new Permission
                {
                    Id = Guid.NewGuid(),
                    Name = p
                }).ToList();

            await tenantDb.Permissions.AddRangeAsync(permissions);
            await tenantDb.SaveChangesAsync();

            // 7️⃣ Assign all permissions to Admin role
            var adminRole = await roleManager.FindByNameAsync("Admin");

            foreach (var permission in permissions)
            {
                tenantDb.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id,
                });
            }

            await tenantDb.SaveChangesAsync();

            // 8️⃣ Seed feature flags (using AppDb)
            var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(tenantConnectionString)
                .Options;

            using var appDb = new ApplicationDbContext(appOptions);
            await appDb.Database.MigrateAsync(); // Ensure business tables are created

            var features = FeatureFlags.All
                .Select(f => new TenantFeature
                {
                    FeatureKey = f,
                    IsEnabled = true,
                    Description = $"Enable/disable the {f} module"
                }).ToList();

            await appDb.TenantFeatures.AddRangeAsync(features);
            await appDb.SaveChangesAsync();

            // 9️⃣ Create admin user
            var userStore = new UserStore<ApplicationUser>(tenantDb);
            var userManager = new UserManager<ApplicationUser>(
                userStore, null, new PasswordHasher<ApplicationUser>(),
                null, null, null, null, null, null);

            var admin = new ApplicationUser
            {
                UserName = request.AdminEmail,
                Email = request.AdminEmail,
                FullName = "System Administrator",
                IsActive = true,
            };

            await userManager.CreateAsync(admin, request.AdminPassword);
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
