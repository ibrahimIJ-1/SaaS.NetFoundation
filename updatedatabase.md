dotnet ef migrations add SyncTenantIdentityModel -c TenantIdentityDbContext
dotnet ef database update -c TenantIdentityDbContext