using Platform.Domain.Clinical;
using System;

namespace Platform.Application.Clinical.Appointments.DTOs
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = default!;
        public string DoctorId { get; set; } = default!;
        public string? DoctorName { get; set; }
        
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public string? StatusName => Status.ToString();

        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public Guid? ChairId { get; set; }
        public string? ChairName { get; set; }
        public Guid? VisitId { get; set; }
    }
}
