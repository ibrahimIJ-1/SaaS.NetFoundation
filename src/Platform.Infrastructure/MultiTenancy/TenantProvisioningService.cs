using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Platform.Application.Multitenancy;
using Platform.Domain.Tenants;
using Platform.Persistence.Identity;
using Platform.Persistence.Tenants;
using System;
using System.Collections.Generic;
using System.Text;

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
                roleStore, null, null, null, null);

            await roleManager.CreateAsync(new IdentityRole("Admin"));
            await roleManager.CreateAsync(new IdentityRole("User"));

            // 6️⃣ Create admin user
            var userStore = new UserStore<ApplicationUser>(tenantDb);
            var userManager = new UserManager<ApplicationUser>(
                userStore, null, new PasswordHasher<ApplicationUser>(),
                null, null, null, null, null, null);

            var admin = new ApplicationUser
            {
                UserName = request.AdminEmail,
                Email = request.AdminEmail,
                TenantId = request.Identifier
            };

            await userManager.CreateAsync(admin, request.AdminPassword);
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
