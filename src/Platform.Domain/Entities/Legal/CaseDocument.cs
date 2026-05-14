using Platform.Domain.Common;
using System;

namespace Platform.Domain.Entities.Legal
{
    public class CaseDocument : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public string FileName { get; set; } = default!;
        public string FileUrl { get; set; } = default!;
        public string ContentType { get; set; } = "application/octet-stream";
        public string? ConvertedPdfUrl { get; set; }
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        public string UploadedBy { get; set; } = default!;
        public string? ExtractedText { get; set; }
        public bool IsSharedWithClient { get; set; } = false;
        public bool NeedsSignature { get; set; } = false;
        public bool IsSigned { get; set; } = false;
        public int Version { get; set; } = 1;
        public Guid? ParentDocumentId { get; set; }
        public string? OcrStatus { get; set; }


        public LegalCase LegalCase { get; set; } = null!;

        public virtual ICollection<DocumentHighlight> Highlights { get; set; } = new List<DocumentHighlight>();
        public virtual ICollection<DocumentAnnotation> Annotations { get; set; } = new List<DocumentAnnotation>();
        public virtual ICollection<DocumentVideoAnnotation> VideoAnnotations { get; set; } = new List<DocumentVideoAnnotation>();
    }
}
