using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public enum ToothStatus
    {
        Healthy,
        Caries,           // التسوس
        Filling,          // حشوة
        RootCanal,        // علاج عصب
        Crown,            // تاج
        Bridge,           // جسر
        Implant,          // زرعة
        Missing,          // غائب
        Impacted,         // منطمر
        Fractured,        // مكسور
        Mobility,         // حركة
        Gingivitis,       // التهاب لثة
        ExtractionNeeded  // يحتاج خلع
    }

    public class ToothCondition : BaseEntity
    {
        public Guid DentalChartId { get; set; }
        public DentalChart DentalChart { get; set; } = null!;

        // FDI World Dental Federation notation (e.g., 11-18, 21-28, 31-38, 41-48)
        public int ToothNumber { get; set; }
        
        public ToothStatus Status { get; set; }
        public string? Notes { get; set; }

        public ToothCondition() { }

        public ToothCondition(Guid dentalChartId, int toothNumber, ToothStatus status)
        {
            DentalChartId = dentalChartId;
            ToothNumber = toothNumber;
            Status = status;
        }
    }
}
