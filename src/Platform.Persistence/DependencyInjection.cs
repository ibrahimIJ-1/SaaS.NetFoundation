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

            services.AddScoped<ApplicationDbContext>(provider =>
            {
                var tenantProvider = provider.GetRequiredService<ITenantProvider>();

                if (tenantProvider.CurrentTenant == null)
                    throw new Exception("Tenant not resolved");

                var optionsBuilder =
                    new DbContextOptionsBuilder<ApplicationDbContext>();

                optionsBuilder.UseSqlServer(
                    tenantProvider.CurrentTenant.ConnectionString);

                return new ApplicationDbContext(optionsBuilder.Options);
            });

            services.AddHttpContextAccessor();

            return services;
        }
    }
}
