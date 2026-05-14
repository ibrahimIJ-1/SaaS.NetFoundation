using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Platform.Application.Abstractions;
using Platform.Application.Auth;
using Platform.Application.Multitenancy;
using Platform.Domain.Tenants;
using Platform.Infrastructure.MultiTenancy;
using Platform.Persistence;
using Platform.Persistence.Identity;
using Platform.Persistence.Tenants;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly TenantRegistryDbContext _registryDb;
        private readonly TenantIdentityDbContext _dbContext;
        private readonly ApplicationDbContext _appDb;

        public AuthController(IConfiguration configuration,
                              TenantIdentityDbContext dbContext,
                              ApplicationDbContext appDb,
                              TenantRegistryDbContext registryDb)
        {
            _configuration = configuration;
            _registryDb = registryDb;
            _dbContext = dbContext;
            _appDb = appDb;
        }

        [HttpPost("login")]
        [SkipTenantResolution]
        public async Task<IActionResult> Login([FromBody] LoginRequest request,
                                               [FromHeader(Name = "X-Tenant-ID")] string tenantId)
        {
            if (string.IsNullOrWhiteSpace(tenantId))
                return BadRequest("Tenant header required");

            var tenant = await _registryDb.Tenants.FirstOrDefaultAsync(t => t.Identifier == tenantId);
            if (tenant == null) return BadRequest("Tenant not found");

            // Create tenant Identity DbContext dynamically
            var options = new DbContextOptionsBuilder<TenantIdentityDbContext>()
                .UseSqlServer(tenant.ConnectionString)
                .Options;

            using var identityDb = new TenantIdentityDbContext(options);

            var userManager = new UserManager<ApplicationUser>(
                new UserStore<ApplicationUser>(identityDb),
                null,
                new PasswordHasher<ApplicationUser>(),
                new List<IUserValidator<ApplicationUser>>(),
                new List<IPasswordValidator<ApplicationUser>>(),
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                null, null);

            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
                return Unauthorized("Invalid credentials");

            if (!user.IsActive)
                return Unauthorized("Account is disabled");

            var roles = await userManager.GetRolesAsync(user);

            var permissions = await identityDb.RolePermissions
                .Where(rp => roles.Contains(rp.Role.Name))
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();

            // Get feature flags
            var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(tenant.ConnectionString)
                .Options;

            using var appDb = new ApplicationDbContext(appOptions);

            var features = await appDb.TenantFeatures
                .Where(f => f.IsEnabled)
                .Select(f => f.FeatureKey)
                .ToListAsync();

            var token = GenerateJwt(user, roles, tenant.Identifier, permissions);
            return Ok(new
            {
                token,
                tenantId = tenant.Identifier,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    jobTitle = user.JobTitle,
                    avatarUrl = user.AvatarUrl,
                    preferredLanguage = user.PreferredLanguage,
                    contactId = user.ContactId,
                    roles = roles,
                    permissions = permissions,
                    features = features
                }
            });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _dbContext.Users
                .OfType<ApplicationUser>()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("User not found");

            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.JobTitle))
                user.JobTitle = request.JobTitle;
            if (!string.IsNullOrWhiteSpace(request.PreferredLanguage))
                user.PreferredLanguage = request.PreferredLanguage;
            if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
                user.AvatarUrl = request.AvatarUrl;

            if (!string.IsNullOrWhiteSpace(request.CurrentPassword) && !string.IsNullOrWhiteSpace(request.NewPassword))
            {
                var userManager = new UserManager<ApplicationUser>(
                    new UserStore<ApplicationUser>(_dbContext),
                    null,
                    new PasswordHasher<ApplicationUser>(),
                    new List<IUserValidator<ApplicationUser>>(),
                    new List<IPasswordValidator<ApplicationUser>>(),
                    new UpperInvariantLookupNormalizer(),
                    new IdentityErrorDescriber(),
                    null, null);

                var changeResult = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
                if (!changeResult.Succeeded)
                    return BadRequest(changeResult.Errors.Select(e => e.Description));
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _dbContext.Users
                .OfType<ApplicationUser>()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("User not found");

            var userManager = new UserManager<ApplicationUser>(
                new UserStore<ApplicationUser>(_dbContext),
                null,
                new PasswordHasher<ApplicationUser>(),
                new List<IUserValidator<ApplicationUser>>(),
                new List<IPasswordValidator<ApplicationUser>>(),
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                null, null);

            var roles = await userManager.GetRolesAsync(user);

            var permissions = await _dbContext.RolePermissions
                .Where(rp => roles.Contains(rp.Role.Name))
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();

            var features = await _appDb.TenantFeatures
                .Where(f => f.IsEnabled)
                .Select(f => f.FeatureKey)
                .ToListAsync();

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                jobTitle = user.JobTitle,
                avatarUrl = user.AvatarUrl,
                preferredLanguage = user.PreferredLanguage,
                contactId = user.ContactId,
                roles = roles,
                permissions = permissions,
                features = features
            });
        }

        private string GenerateJwt(ApplicationUser user, IList<string> roles, string tenantId, IList<string> permissions)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim("tenantId", tenantId),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!)
        };

            if (user.ContactId.HasValue)
            {
                claims.Add(new Claim("contactId", user.ContactId.Value.ToString()));
            }

            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r))); // matches RoleClaimType
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiryMinutes"]!)),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? JobTitle { get; set; }
        public string? PreferredLanguage { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
