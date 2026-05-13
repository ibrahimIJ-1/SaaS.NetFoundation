using Platform.Domain.Common;
using System;

namespace Platform.Domain.Entities.Legal
{
    public class CourtSession : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public LegalCase LegalCase { get; set; } = null!;
        public DateTime SessionDate { get; set; }
        public string CourtName { get; set; } = default!;
        public string? JudgeName { get; set; }
        public string? RoomNumber { get; set; }
        public string? Notes { get; set; }
        public string? Decision { get; set; }
        public SessionStatus Status { get; set; } = SessionStatus.Scheduled;
    }

    public enum SessionStatus
    {
        Scheduled,
        Held,
        Adjourned,
        Canceled
    }
}
