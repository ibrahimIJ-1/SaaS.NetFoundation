using Microsoft.Extensions.DependencyInjection;
using Platform.Application.Abstractions;
using Platform.Infrastructure.MultiTenancy;

namespace Platform.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // Register external services, queues, email, etc.
            services.AddScoped<ITenantProvider, TenantProvider>();
            services.AddScoped<TenantDatabaseInitializer>();

            return services;
        }
    }
}
