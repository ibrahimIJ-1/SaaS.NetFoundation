using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities;
using Platform.Persistence;
using Platform.Persistence.Identity;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/tenant/features")]
    public class TenantFeaturesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public TenantFeaturesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var features = await _dbContext.TenantFeatures
                .Select(f => new
                {
                    f.Id,
                    f.FeatureKey,
                    f.IsEnabled,
                    f.Description
                })
                .ToListAsync();

            return Ok(features);
        }

        [Authorize(Policy = "Permission.Settings.ManageFeatures")]
        [HttpPut("{featureKey}")]
        public async Task<IActionResult> Toggle(string featureKey, [FromBody] ToggleFeatureRequest request)
        {
            var feature = await _dbContext.TenantFeatures
                .FirstOrDefaultAsync(f => f.FeatureKey == featureKey);

            if (feature == null)
                return NotFound($"Feature '{featureKey}' not found");

            feature.IsEnabled = request.IsEnabled;
            await _dbContext.SaveChangesAsync();

            return Ok(new { feature.FeatureKey, feature.IsEnabled });
        }
    }

    public class ToggleFeatureRequest
    {
        public bool IsEnabled { get; set; }
    }
}
