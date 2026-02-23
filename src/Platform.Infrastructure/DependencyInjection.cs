using Microsoft.Extensions.DependencyInjection;

namespace Platform.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // Register external services, queues, email, etc.

            return services;
        }
    }
}
