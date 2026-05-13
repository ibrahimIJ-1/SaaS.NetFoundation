using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class ContactInteraction : AuditableEntity
    {
        public Guid ContactId { get; set; }
        public virtual Contact Contact { get; set; } = default!;

        public InteractionType Type { get; set; } = InteractionType.Note;

        public DateTime InteractionDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Description { get; set; } = default!;

        public string? AuthorName { get; set; }
    }

    public enum InteractionType
    {
        Call,
        Email,
        Meeting,
        Letter,
        Note,
        Document
    }
}
