using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Platform.Application.Abstractions;
using Platform.Persistence.Tenants;


namespace Platform.Persistence
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPersistence(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDbContext<TenantRegistryDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("MasterDb")));

            services.AddDbContextFactory<ApplicationDbContext>((provider, optionsBuilder) =>
            {
                var tenantProvider = provider.GetRequiredService<ITenantProvider>();

                var connectionString = tenantProvider.CurrentTenant?.ConnectionString;

                if (connectionString != null)
                    optionsBuilder.UseSqlServer(connectionString);
                else
                    optionsBuilder.UseSqlServer(
                        provider.GetRequiredService<IConfiguration>()
                            .GetConnectionString("MasterDb")); // fallback DB for Swagger / design-time
            });

            services.AddHttpContextAccessor();

            return services;
        }
    }
}
