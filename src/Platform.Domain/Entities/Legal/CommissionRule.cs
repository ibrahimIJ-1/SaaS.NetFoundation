using Platform.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class CommissionRule : AuditableEntity
    {
        [Required]
        public string LawyerId { get; set; } = default!;
        
        public string LawyerName { get; set; } = default!;

        // Calculation logic
        public decimal Percentage { get; set; } // e.g., 10%
        public decimal FixedAmount { get; set; } // e.g., $100 per case
        
        public string? CaseTypeFilter { get; set; } // Only for specific case types if set
        
        public bool IsActive { get; set; } = true;
    }
}
