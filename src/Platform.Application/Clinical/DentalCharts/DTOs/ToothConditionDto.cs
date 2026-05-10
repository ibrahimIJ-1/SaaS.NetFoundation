using Platform.Domain.Clinical;
using System;

namespace Platform.Application.Clinical.DentalCharts.DTOs
{
    public class ToothConditionDto
    {
        public Guid Id { get; set; }
        public int ToothNumber { get; set; }
        public ToothStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
