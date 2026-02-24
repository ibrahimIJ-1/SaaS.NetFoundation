using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Platform.Application.Auth;
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
    [SkipTenantResolution] // 👈 Important
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly TenantRegistryDbContext _registryDbContext;

        public AuthController(
            UserManager<IdentityUser> userManager,
            IConfiguration configuration,
            TenantRegistryDbContext registryDbContext)
        {
            _userManager = userManager;
            _configuration = configuration;
            _registryDbContext = registryDbContext;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request,
            [FromHeader(Name = "X-Tenant-ID")] string tenantId)
        {
            if (string.IsNullOrWhiteSpace(tenantId))
                return BadRequest("Tenant header required");

            var tenant = await _registryDbContext.Tenants
        .FirstOrDefaultAsync(t => t.Identifier == tenantId);

            if (tenant == null)
                return BadRequest("Tenant not found");

            // Step 2: Create tenant Identity DbContext dynamically
            var optionsBuilder = new DbContextOptionsBuilder<TenantIdentityDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString);

            using var tenantIdentityDb = new TenantIdentityDbContext(optionsBuilder.Options);

            var store = new UserStore<IdentityUser>(tenantIdentityDb);
            var userManager = new UserManager<IdentityUser>(
                store,
                null,
                new PasswordHasher<IdentityUser>(),
                new List<IUserValidator<IdentityUser>>(),
                new List<IPasswordValidator<IdentityUser>>(),
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                null,
                null
            );

            // Step 4: Validate user
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
                return Unauthorized("Invalid credentials");

            var roles = await userManager.GetRolesAsync(user);

            // Step 5: Generate JWT (your existing method)
            var token = GenerateJwt(user, roles, tenant.Identifier);

            return Ok(new
            {
                token,
                tenantId = tenant.Identifier
            });
        }

        private string GenerateJwt(
            IdentityUser user,
            IList<string> roles,
            string tenantId)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim("tenantId", tenantId),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!)
        };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    int.Parse(jwtSettings["ExpiryMinutes"]!)),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
