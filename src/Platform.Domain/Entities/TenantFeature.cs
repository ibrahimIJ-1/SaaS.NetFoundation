using Platform.Domain.Common;

namespace Platform.Domain.Entities
{
    public class TenantFeature : AuditableEntity
    {
        public string FeatureKey { get; set; } = default!;
        public bool IsEnabled { get; set; }
        public string? Description { get; set; }
    }
}
