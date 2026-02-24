using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Platform.API.Middleware;
using Platform.Application;
using Platform.Application.Abstractions;
using Platform.Application.Multitenancy;
using Platform.Infrastructure;
using Platform.Infrastructure.MultiTenancy;
using Platform.Persistence;
using Platform.Persistence.Identity;
using Platform.Persistence.Seed;
using Platform.Persistence.Tenants;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddScoped<ITenantProvider, TenantProvider>();
builder.Services.AddDbContext<TenantIdentityDbContext>((provider, options) =>
{
    var tenantProvider = provider.GetRequiredService<ITenantProvider>();

    var connectionString = tenantProvider.GetConnectionString();

    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
});


builder.Services
    .AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<TenantIdentityDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddScoped<ITenantProvisioningService, TenantProvisioningService>();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<TenantRegistryDbContext>();
    await MasterDbSeeder.SeedAsync(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();
