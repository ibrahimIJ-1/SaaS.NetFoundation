using Platform.Domain.Common;
using System;
using System.Collections.Generic;

namespace Platform.Domain.Entities.Legal
{
    public enum CaseStatus { Active, Pending, Won, Lost, Archived }
    public enum Priority { Low, Medium, High, Urgent }

    public class LegalCase : AuditableEntity
    {
        public string CaseNumber { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string ClientId { get; set; } = default!;
        public string ClientName { get; set; } = default!;
        public string CaseType { get; set; } = default!;
        public CaseStatus Status { get; set; } = CaseStatus.Active;
        public Priority Priority { get; set; } = Priority.Medium;
        public string CourtInfo { get; set; } = default!;
        public string AssignedLawyerId { get; set; } = default!;
        public string AssignedLawyerName { get; set; } = default!;
        public DateTime OpenDate { get; set; } = DateTime.UtcNow;
        public DateTime? CloseDate { get; set; }
        public string? Description { get; set; }

        public Guid? ContactId { get; set; }
        public virtual Contact? Contact { get; set; }
        
        public ICollection<Opponent> Opponents { get; set; } = new List<Opponent>();
        public ICollection<CaseStage> Stages { get; set; } = new List<CaseStage>();
        public ICollection<CourtSession> Sessions { get; set; } = new List<CourtSession>();
        public ICollection<CaseNote> Notes { get; set; } = new List<CaseNote>();
        public ICollection<CaseDocument> Documents { get; set; } = new List<CaseDocument>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<TrustTransaction> TrustTransactions { get; set; } = new List<TrustTransaction>();
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public List<string> Tags { get; set; } = new List<string>();
    }
}
