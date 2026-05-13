using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class SavedSearch : AuditableEntity
    {
        [Required]
        public string UserId { get; set; } = default!;

        [Required]
        public string Name { get; set; } = default!;

        [Required]
        public string SearchParamsJson { get; set; } = default!; // Serialized filter criteria

        public string? Icon { get; set; }
    }
}
