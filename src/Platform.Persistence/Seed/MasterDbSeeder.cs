using Microsoft.EntityFrameworkCore;
using Platform.Domain.Tenants;
using Platform.Persistence.Tenants;

namespace Platform.Persistence.Seed
{
    public static class MasterDbSeeder
    {
        public static async Task SeedAsync(TenantRegistryDbContext context)
        {
            if (await context.Tenants.AnyAsync())
                return;

            var tenant = new Tenant(
                name: "Default Tenant",
                identifier: "tenant1",
                connectionString:
                    "Server=.;Database=Platform_Tenant1;Trusted_Connection=True;TrustServerCertificate=True;"
            );

            context.Tenants.Add(tenant);
            await context.SaveChangesAsync();
        }
    }
}
