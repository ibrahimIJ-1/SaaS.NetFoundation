using Platform.Domain.Common;
using System;

namespace Platform.Domain.Entities.Legal
{
    public class LegalTask : AuditableEntity
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? AssigneeId { get; set; }
        public string? AssigneeName { get; set; }
        
        // Optional relation to a Case
        public Guid? LegalCaseId { get; set; }
        public LegalCase? LegalCase { get; set; }

        public Priority Priority { get; set; } = Priority.Medium;
        public TaskType Type { get; set; } = TaskType.General;
    }

    public enum TaskType
    {
        General,
        Deadline,
        Filing,
        FollowUp,
        Meeting
    }
}
