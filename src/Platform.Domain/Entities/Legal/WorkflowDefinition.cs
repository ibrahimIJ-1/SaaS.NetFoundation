using Platform.Domain.Common;
using System;
using System.Collections.Generic;

namespace Platform.Domain.Entities.Legal
{
    public class WorkflowDefinition : AuditableEntity
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public decimal TotalEstimatedPrice { get; set; }
        public decimal TotalEstimatedExpenses { get; set; }
        
        public ICollection<WorkflowStepDefinition> Steps { get; set; } = new List<WorkflowStepDefinition>();
    }

    public class WorkflowStepDefinition : AuditableEntity
    {
        public Guid WorkflowDefinitionId { get; set; }
        public virtual WorkflowDefinition WorkflowDefinition { get; set; } = default!;
        
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public decimal EstimatedPrice { get; set; }
        public decimal EstimatedExpense { get; set; }
        public int Order { get; set; }
        
        public List<string> RequiredFileNames { get; set; } = new List<string>();
        public List<string> DefaultAssigneeContactIds { get; set; } = new List<string>();
    }
}
