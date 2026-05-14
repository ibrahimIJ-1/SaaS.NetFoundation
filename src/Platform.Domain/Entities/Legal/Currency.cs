using System.ComponentModel.DataAnnotations;
using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Platform.Domain.Entities.Legal
{
    public class Currency : BaseEntity
    {
        [Required] public string Code { get; set; } = default!;
        [Required] public string Name { get; set; } = default!;
        [Required] public string Symbol { get; set; } = default!;
        public decimal ExchangeRate { get; set; } // Rate relative to base currency
        public bool IsBase { get; set; }

        [JsonIgnore]
        public virtual ICollection<WorkflowDefinition> WorkflowDefinitions { get; set; } = new List<WorkflowDefinition>();
        
        [JsonIgnore]
        public virtual ICollection<LegalTransaction> Transactions { get; set; } = new List<LegalTransaction>();
        
        [JsonIgnore]
        public virtual ICollection<TransactionStepInstance> TransactionStepInstances { get; set; } = new List<TransactionStepInstance>();

        [JsonIgnore]
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

        [JsonIgnore]
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

        [JsonIgnore]
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

        [JsonIgnore]
        public virtual ICollection<TrustTransaction> TrustTransactions { get; set; } = new List<TrustTransaction>();
    }
}
