using Platform.Domain.Common;
using System;
using System.Collections.Generic;

namespace Platform.Domain.Entities.Legal
{
    public enum TransactionStatus { Active, Completed, Cancelled }
    public enum StepStatus { Pending, InProgress, Completed }

    public class LegalTransaction : AuditableEntity
    {
        public string TransactionNumber { get; set; } = default!;

        public Guid WorkflowDefinitionId { get; set; }
        public virtual WorkflowDefinition WorkflowDefinition { get; set; } = default!;

        public Guid? ContactId { get; set; }
        public virtual Contact? Contact { get; set; }

        public string ClientName { get; set; } = default!;
        public TransactionStatus Status { get; set; } = TransactionStatus.Active;

        /// <summary>Agreed price with the client (defaults to template estimate)</summary>
        public decimal ActualPrice { get; set; }
        public string? Notes { get; set; }

        public ICollection<TransactionStepInstance> Steps { get; set; } = new List<TransactionStepInstance>();
    }

    public class TransactionStepInstance : AuditableEntity
    {
        public Guid LegalTransactionId { get; set; }
        public virtual LegalTransaction LegalTransaction { get; set; } = default!;

        public Guid StepDefinitionId { get; set; }
        public virtual WorkflowStepDefinition StepDefinition { get; set; } = default!;

        public string StepName { get; set; } = default!; // snapshot at creation time
        public int Order { get; set; }
        public StepStatus Status { get; set; } = StepStatus.Pending;

        /// <summary>Actual price charged/allocated for this step</summary>
        public decimal ActualPrice { get; set; }

        /// <summary>Actual expense incurred during this step (e.g. government fees)</summary>
        public decimal ActualExpense { get; set; }

        /// <summary>Expense description/notes for this step</summary>
        public string? ExpenseDescription { get; set; }

        /// <summary>JSON snapshot of assigned persons at creation time</summary>
        public string AssignedPersonsJson { get; set; } = "[]";

        public DateTime? CompletionDate { get; set; }
        public string? Notes { get; set; }

        /// <summary>Comma-separated list of uploaded file paths or names</summary>
        public string? UploadedFilesJson { get; set; }
    }
}
