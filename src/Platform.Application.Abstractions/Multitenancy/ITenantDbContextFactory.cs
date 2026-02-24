using Platform.Persistence.Identity;
using Microsoft.EntityFrameworkCore;

namespace Platform.Application.Abstractions.Multitenancy
{
    public interface ITenantDbContextFactory
    {
        TenantIdentityDbContext Create(string connectionString);
    }

    public class TenantDbContextFactory : ITenantDbContextFactory
    {
        public TenantIdentityDbContext Create(string connectionString)
        {
            var options = new DbContextOptionsBuilder<TenantIdentityDbContext>()
                .UseSqlServer(connectionString)
                .Options;

            return new TenantIdentityDbContext(options);
        }
    }
}
