using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Platform.API.Middleware;
using Platform.Application;
using Platform.Application.Abstractions;
using Platform.Application.Common.Security;
using Platform.Application.Jobs.Interfaces;
using Platform.Application.Messaging.Interfaces;
using Platform.Application.Multitenancy;
using Platform.Application.Realtime.Interfaces;
using Platform.Infrastructure;
using Platform.Infrastructure.Jobs.Services;
using Platform.Infrastructure.Messaging;
using Platform.Infrastructure.MultiTenancy;
using Platform.Infrastructure.Notifications;
using Platform.Infrastructure.Notifications.Jobs;
using Platform.Infrastructure.Realtime.Hubs;
using Platform.Persistence;
using Platform.Persistence.Identity;
using Platform.Persistence.Seed;
using Platform.Persistence.Tenants;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthorization();

builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .WithOrigins("http://localhost:3000") // frontend URL
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Core layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddPersistence(builder.Configuration);

// Tenant provider
builder.Services.AddScoped<ITenantProvider, TenantProvider>();
builder.Services.AddScoped<ITenantProvisioningService, TenantProvisioningService>();

// Master database
builder.Services.AddDbContext<TenantRegistryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MasterDb")));

// Tenant-aware Identity DbContext
builder.Services.AddDbContext<TenantIdentityDbContext>((provider, options) =>
{
    var tenantProvider = provider.GetRequiredService<ITenantProvider>();
    var configuration = provider.GetRequiredService<IConfiguration>();
    var connStr = tenantProvider.CurrentTenant?.ConnectionString
                  ?? configuration.GetConnectionString("MasterDb");
    options.UseSqlServer(connStr);
});

// Identity
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<TenantIdentityDbContext>()
    .AddDefaultTokenProviders();

// Tenant-aware application DbContext
builder.Services.AddDbContext<ApplicationDbContext>((provider, options) =>
{
    var tenantProvider = provider.GetRequiredService<ITenantProvider>();
    var configuration = provider.GetRequiredService<IConfiguration>();
    var connStr = tenantProvider.CurrentTenant?.ConnectionString
                  ?? configuration.GetConnectionString("MasterDb");
    options.UseSqlServer(connStr);
});

// JWT Authentication — explicitly override Identity's cookie defaults
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]!)),

            NameClaimType = JwtRegisteredClaimNames.Sub, // maps to User.Identity.Name
            RoleClaimType = ClaimTypes.Role                      // maps to User.IsInRole()
        };
    });

// Controllers + Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IJobService, JobService>();

builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("MasterDb")));

builder.Services.AddHangfireServer();

builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration["Redis:ConnectionString"]);

builder.Services.AddSingleton<RabbitMqConnection>(
    new RabbitMqConnection("amqp://admin:admin@localhost:5672"));
builder.Services.AddSingleton<IMessageBus, RabbitMqPublisher>();
builder.Services.AddSingleton<RabbitMqConsumer>();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider
        .GetRequiredService<IRecurringJobManager>();

    recurringJobManager.AddOrUpdate<NotificationRetryJob>(
        "retry-notifications",
        job => job.Execute(),
        Cron.Minutely);
}
// Seed Master DB
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<TenantRegistryDbContext>();
    await MasterDbSeeder.SeedAsync(context);
}

// Middleware pipeline
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();                         // ✅ 1. Validate JWT first
app.UseMiddleware<TenantFromJwtMiddleware>();     // ✅ 2. Extract tenant from authenticated JWT
//app.UseMiddleware<TenantResolutionMiddleware>();  // ✅ 3. Fallback tenant resolution
app.UseAuthorization();   
app.MapHub<NotificationHub>("/hubs/notifications");

app.UseHangfireDashboard();// ✅ 4. Authorize

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

var consumer = app.Services.GetRequiredService<RabbitMqConsumer>();
await consumer.StartAsync();
app.Run();