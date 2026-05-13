using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Platform.Domain.Entities.Legal
{
    public class Currency : BaseEntity
    {
        public string Code { get; set; } // USD, IQD, etc.
        public string Name { get; set; }
        public string Symbol { get; set; }
        public decimal ExchangeRate { get; set; } // Rate relative to base currency
        public bool IsBase { get; set; }

        [JsonIgnore]
        public virtual ICollection<WorkflowDefinition> WorkflowDefinitions { get; set; } = new List<WorkflowDefinition>();
        
        [JsonIgnore]
        public virtual ICollection<LegalTransaction> Transactions { get; set; } = new List<LegalTransaction>();
        
        [JsonIgnore]
        public virtual ICollection<TransactionStepInstance> TransactionStepInstances { get; set; } = new List<TransactionStepInstance>();
    }
}
