using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class DocumentAnnotation : AuditableEntity
    {
        public Guid DocumentId { get; set; }
        public virtual CaseDocument? Document { get; set; }

        public int PageNumber { get; set; }
        public double X { get; set; }
        public double Y { get; set; }

        [Required]
        public string Comment { get; set; } = default!;

        public string? AuthorName { get; set; }
        
        public bool IsPrivate { get; set; } = false;
    }
}
