using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class ChatMessage : AuditableEntity
    {
        [Required]
        public string SenderId { get; set; } = default!;

        [Required]
        public string ReceiverId { get; set; } = default!;

        [Required]
        public string Content { get; set; } = default!;

        public bool IsRead { get; set; } = false;

        public Guid? LegalCaseId { get; set; } // Optional: Link to a specific case context
        public virtual LegalCase? LegalCase { get; set; }
    }
}
