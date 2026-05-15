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

            Console.WriteLine($"Found {tenants.Count} active tenants to migrate.");

            foreach (var tenant in tenants)
            {
                try 
                {
                    Console.WriteLine($"---------------------------------------------------------");
                    Console.WriteLine($"Starting migration for tenant: {tenant.Identifier}");
                    Console.WriteLine($"Connection: {tenant.ConnectionString}");

                    // 1. Migrate Identity Context
                    Console.WriteLine("-> Migrating Identity Context...");
                    var identityOptions = new DbContextOptionsBuilder<TenantIdentityDbContext>()
                        .UseSqlServer(tenant.ConnectionString)
                        .Options;

                    using (var identityDb = new TenantIdentityDbContext(identityOptions))
                    {
                        await identityDb.Database.MigrateAsync();
                    }

                    // 2. Migrate Application Context
                    Console.WriteLine("-> Migrating Application Context...");
                    var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                        .UseSqlServer(tenant.ConnectionString)
                        .Options;

                    using (var appDb = new ApplicationDbContext(appOptions))
                    {
                        await appDb.Database.MigrateAsync();
                    }

                    Console.WriteLine($"[SUCCESS] Migrated tenant: {tenant.Identifier}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Failed to migrate tenant {tenant.Identifier}: {ex.Message}");
                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"Inner Error: {ex.InnerException.Message}");
                    }
                }
            }
        }
    }
}
