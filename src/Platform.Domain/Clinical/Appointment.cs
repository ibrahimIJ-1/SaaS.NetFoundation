using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public enum AppointmentStatus
    {
        Scheduled,
        Confirmed,
        Arrived,
        InProgress,
        Completed,
        Cancelled,
        NoShow
    }

    public class Appointment : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        // Doctor/Staff who will perform the appointment
        public string DoctorId { get; set; } = default!;

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        public Guid? ChairId { get; set; }
        public Chair? Chair { get; set; }

        public string? Reason { get; set; }
        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;

        public Visit? Visit { get; set; }

        public Appointment() { }

        public Appointment(Guid patientId, string doctorId, DateTime startTime, DateTime endTime, string? reason = null)
        {
            PatientId = patientId;
            DoctorId = doctorId;
            StartTime = startTime;
            EndTime = endTime;
            Reason = reason;
        }
    }
}
