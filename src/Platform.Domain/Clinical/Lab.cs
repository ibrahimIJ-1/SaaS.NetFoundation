using System;
using System.Collections.Generic;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class LabProvider : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string? ContactPerson { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        
        public ICollection<LabOrder> Orders { get; set; } = new List<LabOrder>();
    }

    public enum LabOrderStatus
    {
        Draft,
        Sent,
        InProgress,
        Received,
        Completed,
        Cancelled
    }

    public class LabOrder : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public Guid DoctorId { get; set; }
        // Note: Doctor is typically a User, linking here via ID
        
        public Guid LabProviderId { get; set; }
        public LabProvider Provider { get; set; } = null!;

        public string OrderNumber { get; set; } = default!;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? ExpectedDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        
        public LabOrderStatus Status { get; set; } = LabOrderStatus.Draft;
        public decimal TotalCost { get; set; }
        public string? Notes { get; set; }

        public ICollection<LabWorkItem> Items { get; set; } = new List<LabWorkItem>();
    }

    public class LabWorkItem : BaseEntity
    {
        public Guid LabOrderId { get; set; }
        public LabOrder LabOrder { get; set; } = null!;

        public string Description { get; set; } = default!; // e.g., Zirconia Crown
        public string? ToothNumber { get; set; }
        public string? Shade { get; set; }
        public decimal Cost { get; set; }
    }
}
