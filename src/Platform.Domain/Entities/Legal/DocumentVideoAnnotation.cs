using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class DocumentVideoAnnotation : AuditableEntity
    {
        public Guid DocumentId { get; set; }
        public virtual CaseDocument? Document { get; set; }

        public double TimeStart { get; set; }
        public double TimeEnd { get; set; }

        [Required]
        public string Comment { get; set; } = default!;

        public string Color { get; set; } = "#D4AF37";

        public string? Label { get; set; }
    }
}
