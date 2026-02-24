using Microsoft.EntityFrameworkCore;
using Platform.Persistence;

namespace Platform.Infrastructure.MultiTenancy
{
    public class TenantDatabaseInitializer
    {
        private readonly ApplicationDbContext _dbContext;

        public TenantDatabaseInitializer(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task InitializeAsync()
        {
            await _dbContext.Database.MigrateAsync();
        }
    }
}
