using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class DocumentHighlight : AuditableEntity
    {
        public Guid DocumentId { get; set; }
        public virtual CaseDocument? Document { get; set; }

        [Required]
        public string Color { get; set; } = "#D4AF37"; // Default Gold

        public string? TextContent { get; set; }
        
        // Coordinates or range for PDF rendering
        public int PageNumber { get; set; }
        public double X1 { get; set; }
        public double Y1 { get; set; }
        public double X2 { get; set; }
        public double Y2 { get; set; }
        
        public string? RectsJson { get; set; } // Stores JSON array of precise rectangles for multi-line highlighting

        public string? Label { get; set; } // e.g., "Important", "Deadline", "Risk"
        public string? Comment { get; set; } // Unified annotation comment


    }
}
