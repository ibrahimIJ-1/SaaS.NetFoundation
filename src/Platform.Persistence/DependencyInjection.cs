using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Platform.Persistence.Tenants;


namespace Platform.Persistence
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPersistence(
    this IServiceCollection services,
    IConfiguration configuration)
        {
            // Master database (Tenants table)
            services.AddDbContext<TenantRegistryDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("MasterDb")));

            // DO NOT configure tenant connection here
            services.AddDbContextFactory<ApplicationDbContext>();

            services.AddHttpContextAccessor();

            return services;
        }
    }
}
