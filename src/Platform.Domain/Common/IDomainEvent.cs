using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Domain.Common
{
    public interface IDomainEvent
    {
        DateTime OccurredOn { get; }
    }
}
