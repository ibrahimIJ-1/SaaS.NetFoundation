using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// Core layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddPersistence(builder.Configuration);

// Master DB
builder.Services.AddDbContext<TenantRegistryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MasterDb")));

builder.Services.AddScoped<ITenantProvisioningService, TenantProvisioningService>();
// Tenant provider
builder.Services.AddScoped<ITenantProvider, TenantProvider>();

// Tenant-aware Identity DbContext (DI) for resolved tenants
builder.Services.AddDbContext<TenantIdentityDbContext>((provider, options) =>
{
    var tenantProvider = provider.GetRequiredService<ITenantProvider>();
    var configuration = provider.GetRequiredService<IConfiguration>();

    var connectionString = tenantProvider.CurrentTenant?.ConnectionString
        ?? configuration.GetConnectionString("MasterDb");

    options.UseSqlServer(connectionString);
});

// Identity
builder.Services
    .AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<TenantIdentityDbContext>()
    .AddDefaultTokenProviders();

// Tenant-aware ApplicationDbContext
builder.Services.AddDbContext<ApplicationDbContext>((provider, options) =>
{
    var tenantProvider = provider.GetRequiredService<ITenantProvider>();
    var configuration = provider.GetRequiredService<IConfiguration>();
    var connectionString = tenantProvider.CurrentTenant?.ConnectionString
        ?? configuration.GetConnectionString("MasterDb");
    options.UseSqlServer(connectionString);
});

// Controllers + Swagger + JWT Auth
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtSettings["Key"]))
        };
    });

var app = builder.Build();

// Seed master DB
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<TenantRegistryDbContext>();
    await MasterDbSeeder.SeedAsync(context);
}

// Pipeline
if (app.Environment.IsDevelopment())
    app.UseSwaggerUI();

app.UseSwagger();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthentication();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();