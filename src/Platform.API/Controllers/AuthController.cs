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
using Platform.Persistence.Identity;
using Platform.Persistence.Tenants;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Platform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SkipTenantResolution] // Important: No tenant required
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly TenantRegistryDbContext _registryDb;
        private readonly TenantIdentityDbContext _dbContext;

        public AuthController(IConfiguration configuration,
        TenantIdentityDbContext dbContext,
                              TenantRegistryDbContext registryDb)
        {
            _configuration = configuration;
            _registryDb = registryDb;
            _dbContext = dbContext;
        }

        [HttpPost("login")]
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

            var roles = await userManager.GetRolesAsync(user);

            var permissions = await identityDb.RolePermissions
    .Where(rp => roles.Contains(rp.Role.Name))
    .Select(rp => rp.Permission.Name)
    .Distinct()
    .ToListAsync();

            var token = GenerateJwt(user, roles, tenant.Identifier, permissions);
            return Ok(new { token, tenantId = tenant.Identifier });
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
}
