using Microsoft.Extensions.DependencyInjection;

namespace Platform.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Register MediatR, validators, services later

            return services;
        }
    }
}
