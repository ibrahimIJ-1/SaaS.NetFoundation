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
            // Note: TenantRegistryDbContext and ApplicationDbContext are 
            // now configured in Program.cs to support dynamic tenant resolution.
            
            services.AddHttpContextAccessor();

            return services;
        }
    }
}
