using System;
using System.Collections.Generic;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public enum TreatmentPlanStatus
    {
        Draft,
        Active,
        Completed,
        Cancelled
    }

    public enum ProcedureStatus
    {
        Proposed,
        InProgress,
        Completed,
        Cancelled
    }

    public class TreatmentPlan : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public string DoctorId { get; set; } = default!;

        public string Title { get; set; } = "Untitled Plan";
        public TreatmentPlanStatus Status { get; set; } = TreatmentPlanStatus.Draft;
        public string? Notes { get; set; }

        public ICollection<TreatmentPlanItem> Items { get; set; } = new List<TreatmentPlanItem>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public TreatmentPlan() { }

        public TreatmentPlan(Guid patientId, string doctorId, string title)
        {
            PatientId = patientId;
            DoctorId = doctorId;
            Title = title;
        }
    }

    public class TreatmentPlanItem : BaseEntity
    {
        public Guid TreatmentPlanId { get; set; }
        public TreatmentPlan TreatmentPlan { get; set; } = null!;

        public string ProcedureName { get; set; } = default!;
        public string? Code { get; set; } // e.g., CDT code

        public int? ToothNumber { get; set; }
        public string? Surface { get; set; } // O, M, D, L, B for fillings

        public decimal Cost { get; set; }
        public ProcedureStatus Status { get; set; } = ProcedureStatus.Proposed;

        // Link to the visit where this procedure was actually completed
        public Guid? PerformedInVisitId { get; set; }
        public Visit? PerformedInVisit { get; set; }

        public ICollection<SessionRecord> SessionRecords { get; set; } = new List<SessionRecord>();

        public DateTime? CompletionDate { get; set; }

        public TreatmentPlanItem() { }
    }
}
