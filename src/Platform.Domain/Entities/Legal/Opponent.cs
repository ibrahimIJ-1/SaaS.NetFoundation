using Platform.Domain.Common;
using System;

namespace Platform.Domain.Entities.Legal
{
    public class Opponent : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public LegalCase LegalCase { get; set; } = null!;
        public string Name { get; set; } = default!;
        public string? LawyerName { get; set; }
        public string? Notes { get; set; }
        public string PartyType { get; set; } = "Opponent"; // e.g. Plaintiff, Defendant, Witness, Representative
    }
}
