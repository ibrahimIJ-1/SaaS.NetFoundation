using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Domain.Common
{
    public abstract class AuditableEntity : BaseEntity
    {
        public DateTime CreatedOn { get; set; }
        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedOn { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}
