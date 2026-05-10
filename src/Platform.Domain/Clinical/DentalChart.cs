using System;
using System.Collections.Generic;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class DentalChart : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public ICollection<ToothCondition> ToothConditions { get; set; } = new List<ToothCondition>();

        public DentalChart() { }

        public DentalChart(Guid patientId)
        {
            PatientId = patientId;
        }
    }
}
