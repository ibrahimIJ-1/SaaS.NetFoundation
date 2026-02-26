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
                var optionsBuilder = new DbContextOptionsBuilder<TenantIdentityDbContext>();
                optionsBuilder.UseSqlServer(tenant.ConnectionString);

                using var tenantDb = new TenantIdentityDbContext(optionsBuilder.Options);
                await tenantDb.Database.MigrateAsync();

                Console.WriteLine($"Migrated tenant {tenant.Identifier}");
            }
        }
    }
}
