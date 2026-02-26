using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Platform.Persistence.Identity;
using Platform.Persistence.Tenants;

var services = new ServiceCollection();

// Load configuration (appsettings.json)
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();

services.AddSingleton<IConfiguration>(configuration);

// Register master tenant registry DB
services.AddDbContext<TenantRegistryDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("MasterDb")));

services.AddScoped<TenantMigrationService>();

var serviceProvider = services.BuildServiceProvider();

var migrator = serviceProvider.GetRequiredService<TenantMigrationService>();
await migrator.MigrateAllTenantsAsync();

Console.WriteLine("All tenants migrated successfully.");