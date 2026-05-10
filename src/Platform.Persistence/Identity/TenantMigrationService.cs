using Microsoft.EntityFrameworkCore;
using Platform.Persistence.Tenants;

namespace Platform.Persistence.Identity
{
    public class TenantMigrationService
    {
        private readonly TenantRegistryDbContext _registryDb;

        public TenantMigrationService(TenantRegistryDbContext registryDb)
        {
            _registryDb = registryDb;
        }

        public async Task MigrateAllTenantsAsync()
        {
            var tenants = await _registryDb.Tenants
                .Where(t => t.IsActive)
                .ToListAsync();

            foreach (var tenant in tenants)
            {
                Console.WriteLine($"Starting migration for tenant: {tenant.Identifier}");

                // 1. Migrate Identity Context
                var identityOptions = new DbContextOptionsBuilder<TenantIdentityDbContext>()
                    .UseSqlServer(tenant.ConnectionString)
                    .Options;

                using (var identityDb = new TenantIdentityDbContext(identityOptions))
                {
                    await identityDb.Database.MigrateAsync();
                }

                // 2. Migrate Application Context
                var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlServer(tenant.ConnectionString)
                    .Options;

                using (var appDb = new ApplicationDbContext(appOptions))
                {
                    await appDb.Database.MigrateAsync();
                }

                Console.WriteLine($"Successfully migrated tenant: {tenant.Identifier}");
            }
        }
    }
}
