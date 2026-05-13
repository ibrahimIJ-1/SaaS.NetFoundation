using Microsoft.AspNetCore.Identity;

namespace Platform.Persistence.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
        public string? JobTitle { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public string PreferredLanguage { get; set; } = "en";
        public Guid? ContactId { get; set; }
    }
}
