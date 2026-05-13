using Platform.Domain.Common;
using System;

namespace Platform.Domain.Entities.Legal
{
    public class CaseStage : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public LegalCase LegalCase { get; set; } = null!;
        public string Name { get; set; } = default!;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Notes { get; set; }
    }
}
