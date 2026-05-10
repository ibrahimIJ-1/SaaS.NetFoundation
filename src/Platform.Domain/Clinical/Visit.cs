using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public enum VisitStatus
    {
        Active,
        Completed,
        Cancelled
    }

    public class Visit : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public string DoctorId { get; set; } = default!;

        public Guid? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;
        public VisitStatus Status { get; set; } = VisitStatus.Active;

        // Clinical Documentation (SOAP)
        public string? ChiefComplaint { get; set; }
        public string? SubjectiveNotes { get; set; }
        public string? ObjectiveNotes { get; set; }
        public string? Assessment { get; set; }
        public string? Plan { get; set; }

        public ICollection<TreatmentPlanItem> PerformedProcedures { get; set; } = new List<TreatmentPlanItem>();
        public ICollection<SessionRecord> SessionRecords { get; set; } = new List<SessionRecord>();

        public bool IsActive { get; set; } = true;

        public Visit() { }

        public Visit(Guid patientId, string doctorId, Guid? appointmentId = null)
        {
            PatientId = patientId;
            DoctorId = doctorId;
            AppointmentId = appointmentId;
        }
    }
}
