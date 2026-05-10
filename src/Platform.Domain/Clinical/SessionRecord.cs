using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class SessionRecord : BaseEntity
    {
        public Guid VisitId { get; set; }
        public Visit Visit { get; set; } = null!;

        public Guid TreatmentPlanItemId { get; set; }
        public TreatmentPlanItem TreatmentPlanItem { get; set; } = null!;

        // What was done in this specific session
        public string Description { get; set; } = default!;
        
        public string? MaterialsUsed { get; set; }
        public string? Anesthesia { get; set; }
        
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }

        public string? Notes { get; set; }

        public SessionRecord() { }

        public SessionRecord(Guid visitId, Guid treatmentPlanItemId, string description)
        {
            VisitId = visitId;
            TreatmentPlanItemId = treatmentPlanItemId;
            Description = description;
        }
    }
}
