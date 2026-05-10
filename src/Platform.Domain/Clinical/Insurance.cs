using System;
using System.Collections.Generic;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class InsuranceProvider : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string? Code { get; set; }
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        
        public ICollection<InsurancePolicy> Policies { get; set; } = new List<InsurancePolicy>();
    }

    public class InsurancePolicy : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public Guid ProviderId { get; set; }
        public InsuranceProvider Provider { get; set; } = null!;

        public string PolicyNumber { get; set; } = default!;
        public string? GroupNumber { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        public decimal CoveragePercentage { get; set; } = 100;
        public decimal YearlyLimit { get; set; }
        public decimal UsedLimit { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public enum ClaimStatus
    {
        Pending,
        Submitted,
        Approved,
        PartiallyApproved,
        Rejected,
        Paid
    }

    public class InsuranceClaim : BaseEntity
    {
        public Guid InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public Guid PolicyId { get; set; }
        public InsurancePolicy Policy { get; set; } = null!;

        public string ClaimNumber { get; set; } = default!;
        public decimal RequestedAmount { get; set; }
        public decimal? ApprovedAmount { get; set; }
        
        public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
        public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;
        public DateTime? ResolutionDate { get; set; }
        
        public string? RejectionReason { get; set; }
        public string? Notes { get; set; }
    }
}
