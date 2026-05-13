using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class LegalTemplate : AuditableEntity
    {
        [Required]
        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        [Required]
        public string Category { get; set; } = default!; // e.g., "Contracts", "Notices", "Court Filings"

        [Required]
        public string Content { get; set; } = default!; // Template content with placeholders

        public string? Language { get; set; } = "Arabic";
    }
}
