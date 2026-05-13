using Microsoft.Extensions.DependencyInjection;
using Platform.Application.Abstractions;
using Platform.Infrastructure.MultiTenancy;
using Platform.Application.Common.Interfaces;
using Platform.Infrastructure.Services;

namespace Platform.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // Register external services, queues, email, etc.
            services.AddHttpClient();
            services.AddScoped<ITenantProvider, TenantProvider>();
            services.AddScoped<TenantDatabaseInitializer>();
            services.AddScoped<IStorageService, Platform.Infrastructure.Storage.S3StorageService>();
            services.AddScoped<IAIService, GeminiAIService>();
            services.AddScoped<IOCRService, AWSTextractService>();

            return services;
        }
    }
}
