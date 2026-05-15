using Platform.Domain.Common;

namespace Platform.Domain.Entities.Legal
{
    public class CaseNote : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public Guid? CourtSessionId { get; set; }
        public string NoteText { get; set; } = default!;
        public string AuthorName { get; set; } = default!;
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public LegalCase LegalCase { get; set; } = null!;
        public CourtSession? CourtSession { get; set; }
    }
}
