using Microsoft.EntityFrameworkCore;
using Platform.Domain.Tenants;

namespace Platform.Persistence.Tenants
{
    public class TenantRegistryDbContext : DbContext
    {
        public TenantRegistryDbContext(DbContextOptions<TenantRegistryDbContext> options)
            : base(options)
        {
        }

        public DbSet<Tenant> Tenants => Set<Tenant>();
    }
}
