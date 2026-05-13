using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class DocumentSignature : AuditableEntity
    {
        public Guid DocumentId { get; set; }
        public virtual CaseDocument Document { get; set; } = default!;

        [Required]
        public string SignedByUserId { get; set; } = default!;

        [Required]
        public string SignerName { get; set; } = default!;

        public DateTime SignedOn { get; set; } = DateTime.UtcNow;

        [Required]
        public string SignatureHash { get; set; } = default!; // Cryptographic hash of the document content at time of signing

        public string? SignatureImageUrl { get; set; } // Visual representation of the signature
        
        public string? IPAddress { get; set; }
    }
}
