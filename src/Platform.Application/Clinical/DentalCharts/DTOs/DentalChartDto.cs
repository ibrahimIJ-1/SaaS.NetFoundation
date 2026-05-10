using System;
using System.Collections.Generic;

namespace Platform.Application.Clinical.DentalCharts.DTOs
{
    public class DentalChartDto
    {
        public Guid PatientId { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<ToothConditionDto> ToothConditions { get; set; } = new();
    }
}
